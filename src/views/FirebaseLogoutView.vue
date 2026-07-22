<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, logoutUser } from '@/auth'

const router = useRouter()
const loading = ref(false)
const message = ref('')
const errorMessage = ref('')

const handleLogout = async () => {
  loading.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await logoutUser()
    message.value = 'Logged out successfully. The console should now show the current user as null.'
    setTimeout(() => {
      router.push({ name: 'FirebaseSignin' })
    }, 1200)
  } catch (error) {
    errorMessage.value = error.code + ': ' + error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card form-card p-4 p-md-5">
        <span class="section-label mb-3">Task 7.2</span>
        <h1 class="h2 mt-3">Firebase log out</h1>
        <p class="text-muted">
          Keep the developer console open here, then click the button to capture the current user
          state after logout.
        </p>

        <div class="status-card mb-4">
          <div class="text-muted small mb-2">Current user before logout</div>
          <div class="fw-semibold">{{ currentUser?.email || 'No active user' }}</div>
        </div>

        <p v-if="message" class="alert alert-success">{{ message }}</p>
        <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>

        <button class="btn btn-dark" type="button" :disabled="loading" @click="handleLogout">
          {{ loading ? 'Logging out...' : 'Log out now' }}
        </button>
      </div>
    </div>
  </section>
</template>
