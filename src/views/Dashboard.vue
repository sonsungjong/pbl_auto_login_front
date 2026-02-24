<template>
  <main class="page">
    <section class="card">
      <h1>Dashboard</h1>
      <p v-if="user">안녕하세요, {{ user.name || user.user_id }}님</p>
      <p v-else class="error">로그인 정보가 없습니다.</p>

      <div class="actions">
        <button @click="goLogin" v-if="!user">로그인 화면</button>
        <button @click="openTargetApp" :disabled="opening" v-if="user">서비스 열기</button>
        <button @click="logout">로그아웃</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="info" class="info">{{ info }}</p>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { API_BASE, TARGET_URL, LAUNCH_TOKEN_ENDPOINT, LAUNCH_TOKEN_QUERY } from '../config';

const router = useRouter();
const user = ref(null);
const opening = ref(false);
const error = ref('');
const info = ref('');

function goLogin() {
  router.push('/login');
}

async function openTargetApp() {
  if (!user.value?.user_id || opening.value) return;

  opening.value = true;
  error.value = '';
  info.value = '';

  try {
    const res = await fetch(`${API_BASE}${LAUNCH_TOKEN_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.value.user_id }),
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || '토큰 생성에 실패했습니다.');
    }

    const cntnKey = String(data.cntn_key || '').trim();
    if (!cntnKey) {
      throw new Error('서버에서 인증 키를 받지 못했습니다.');
    }

    const url = `${TARGET_URL}?cntn_key=${encodeURIComponent(cntnKey)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (e) {
    error.value = e instanceof Error ? e.message : '알 수 없는 오류';
  } finally {
    opening.value = false;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
}

onMounted(() => {
  const raw = localStorage.getItem('user');
  user.value = raw ? JSON.parse(raw) : null;
});
</script>

<style scoped>
.page { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
.card { width: min(480px, 100%); background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 8px 40px rgba(0,0,0,.12); }
.actions { display: flex; gap: 8px; }
button { padding: 10px 16px; }
.error { color: #c00; }
.info { color: #116; }
</style>
