<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { activeRole, roles, setActiveRole } from '@/auth'
import { auth, isFirebaseConfigured } from '@/firebase'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const selectedRole = ref(activeRole.value || roles[0])
const loading = ref(false)
const errorMessage = ref('')

const signInUser = async () => {
  errorMessage.value = ''

  if (!isFirebaseConfigured) {
    errorMessage.value = 'Please add your Firebase web app values to the .env file first.'
    return
  }

  loading.value = true

  try {
    const credential = await signInWithEmailAndPassword(auth, email.value, password.value)
    setActiveRole(selectedRole.value)
    console.log('Current Firebase user after sign in:', {
      uid: credential.user.uid,
      email: credential.user.email,
      role: selectedRole.value
    })
    router.push(route.query.redirect || { name: 'RolePortal' })
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
        <span class="section-label mb-3">Task 7.1 + 7.2</span>
        <h1 class="h2 mt-3">Firebase sign in</h1>
        <p v-if="route.query.denied" class="alert alert-warning">
          Access denied. Please sign in first to open the protected page.
        </p>
        <p class="text-muted">
          Open the browser developer console before clicking Sign in so the current user is visible
          in your screenshot.
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

          <div class="mb-3">
            <label for="signin-role" class="form-label">Role for the system demo</label>
            <select id="signin-role" v-model="selectedRole" class="form-select">
              <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>

          <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>

          <button class="btn btn-dark" type="submit" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
