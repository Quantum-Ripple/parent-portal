<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Auth from '../api/Auth' // keep your existing Auth helper

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Allowed roles for this portal
const ALLOWED_ROLES = ['parent', 'admin']

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    // Auth.login should succeed only for valid credentials.
    // Many Auth.login implementations store token/user in localStorage.
    await Auth.login(email.value, password.value)

    // Try to read the user (either Auth.login stored it, or your app already has it)
    const stored = localStorage.getItem('user')
    const user = stored ? JSON.parse(stored) : null
    const token = localStorage.getItem('token')

    // If Auth.login returned user directly (rare), handle that too:
    // (Uncomment if your Auth.login returns { token, user })
    // const resp = await Auth.login(email.value, password.value)
    // const user = resp?.user

    if (!user || !user.role) {
      // No user returned/stored — treat as login failure
      // Clear anything leftover
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      error.value = 'Login failed (no user info). Try again.'
      loading.value = false
      return
    }

    // Role check (frontend UX block)
    if (!ALLOWED_ROLES.includes(user.role.toLowerCase())) {
      // Not allowed to access principal portal: clear auth and show message
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      error.value = 'Your account does not have access to the Parents portal.'
      loading.value = false
      return
    }

    // Allowed — go to principal dashboard
    router.push('/dashboard')

  } catch (err) {
    // Prefer showing more specific messages when available
    if (err?.response?.status === 401) {
      error.value = 'Invalid credentials. Please try again.'
    } else if (err?.response?.status === 403) {
      error.value = 'You are not authorized to access this portal.'
    } else {
      error.value = 'Login failed. Please try again.'
      console.error('Login error:', err)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-100">
    <div class="bg-white shadow-md rounded-lg p-6 w-full max-w-sm">
      <h2 class="text-xl font-semibold text-center mb-4">Parent Login</h2>

      <input v-model="email" type="email" placeholder="Email"
             class="border rounded w-full p-2 mb-3" />

      <input v-model="password" type="password" placeholder="Password"
             class="border rounded w-full p-2 mb-3" />

      <button @click="handleLogin"
              :disabled="loading"
              class="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:opacity-60">
        <span v-if="!loading">Login</span>
        <span v-else>Signing in...</span>
      </button>

      <p v-if="error" class="text-red-500 text-sm mt-3">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
/* optional small style */
</style>


