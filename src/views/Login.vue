<template>
  <main class="page">
    <section class="card">
      <h1>Auto Login</h1>
      <form @submit.prevent="onSubmit">
        <label>
          사용자 ID
          <input v-model="userId" autocomplete="username" required />
        </label>
        <label>
          비밀번호
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>
        <button :disabled="loading">로그인</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="info" class="info">{{ info }}</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { API_BASE } from '../config';

const router = useRouter();
const userId = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const info = ref('');

async function onSubmit() {
  loading.value = true;
  error.value = '';
  info.value = '';

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId.value, pw: password.value }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || '로그인 실패');
    }

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    sessionStorage.setItem('user', JSON.stringify(data.user));
    sessionStorage.setItem('user_id', String(data.user?.user_id || '').trim());
    info.value = '로그인 성공';
    router.push('/dashboard');
  } catch (e) {
    error.value = e instanceof Error ? e.message : '알 수 없는 오류';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
.card { width: min(480px, 100%); background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 8px 40px rgba(0,0,0,.12); }
label { display: block; margin-bottom: 12px; font-size: 14px; }
input { width: 100%; padding: 10px; margin-top: 6px; }
button { margin-top: 4px; padding: 10px 16px; }
.error { color: #c00; }
.info { color: #116; }
</style>
