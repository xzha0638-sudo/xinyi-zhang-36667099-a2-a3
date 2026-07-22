<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { refreshCurrentProfile } from '@/auth'
import { auth, isFirebaseConfigured } from '@/firebase'

const route = useRoute()
const router = useRouter()

const email = ref(route.query.email || '')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const signInUser = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isFirebaseConfigured) {
    errorMessage.value = 'Please add your Firebase web app values to the .env file first.'
    return
  }

  loading.value = true

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    const profile = refreshCurrentProfile()
    successMessage.value = `Welcome back${profile?.displayName ? `, ${profile.displayName}` : ''}.`
    router.push(route.query.redirect || { name: 'Dashboard' })
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
        <span class="section-label mb-3">Authentication</span>
        <h1 class="h2 mt-3">Sign in to your library account</h1>
        <p v-if="route.query.denied" class="alert alert-warning">
          That page is protected. Sign in first, then we will return you to the page you wanted.
        </p>
        <p class="text-muted">
          Your role is loaded from the profile linked to your email address, so there is no
          separate role picker at sign-in time.
        </p>

        <form @submit.prevent="signInUser">
          <div class="mb-3">
            <label for="signin-email" class="form-label">Email address</label>
            <input
              id="signin-email"
              v-model="email"
              type="email"
              class="form-control"
              placeholder="student@monash.edu"
              required
            />
          </div>

          <div class="mb-3">
            <label for="signin-password" class="form-label">Password</label>
            <input
              id="signin-password"
              v-model="password"
              type="password"
              class="form-control"
              required
            />
          </div>

          <p v-if="successMessage" class="alert alert-success">{{ successMessage }}</p>
          <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>

          <button class="btn btn-dark" type="submit" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
