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
    message.value = 'Logged out successfully. You can sign in again whenever you are ready.'
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
        <span class="section-label mb-3">Session</span>
        <h1 class="h2 mt-3">Sign out of NoMash Library</h1>
        <p class="text-muted">
          Sign out to return to the public catalog and protect access to member-only pages on a
          shared device.
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
