<template>
  <main class="page">
    <section class="card">
      <h1>Dashboard</h1>
      <p v-if="user">환영합니다 {{ user.name || user.user_id }}</p>
      <p v-else class="error">로그인 상태가 아닙니다.</p>

      <div class="actions">
        <button @click="goLogin" v-if="!user">로그인</button>
        <button @click="openTargetApp" :disabled="opening" v-if="user">서비스열기</button>
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

function parseUser(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getCurrentUser() {
  const sessionUserId = sessionStorage.getItem('user_id');
  if (sessionUserId?.trim()) {
    return { user_id: sessionUserId.trim() };
  }

  const sessionUser = parseUser(sessionStorage.getItem('user'));
  if (sessionUser?.user_id) return sessionUser;

  const localUser = parseUser(localStorage.getItem('user'));
  if (localUser?.user_id) return localUser;

  return null;
}

function goLogin() {
  router.push('/login');
}

async function openTargetApp() {
  if (opening.value) return;

  const currentUser = user.value || getCurrentUser();
  const userId = typeof currentUser?.user_id === 'string' ? currentUser.user_id.trim() : '';
  if (!userId) {
    error.value = '로그인 정보가 없어 서비스를 열 수 없습니다.';
    return;
  }
  user.value = currentUser;

  opening.value = true;
  error.value = '';
  info.value = '';

  let cntnKey = '';
  let message = '';

  try {
    const res = await fetch(`${API_BASE}${LAUNCH_TOKEN_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
      credentials: 'include',
    });

    const raw = await res.text();
    const data = raw ? JSON.parse(raw) : {};

    if (res.ok) {
      cntnKey = String(data.cntn_key || '').trim();
      if (!cntnKey) {
        message = '토큰 값이 없어 빈 값으로 실행합니다.';
      }
    } else {
      message = data.message || `토큰 발급 실패(HTTP ${res.status})`;
    }
  } catch (e) {
    message = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
  } finally {
    const url = `${TARGET_URL}?${LAUNCH_TOKEN_QUERY}=${encodeURIComponent(cntnKey)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    if (message) {
      error.value = message;
    } else {
      info.value = '서비스를 열었습니다.';
    }
    opening.value = false;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('user_id');
  router.push('/login');
}

onMounted(() => {
  user.value = getCurrentUser();
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
