<script setup>
import { ref } from 'vue'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@/firebase'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const registerUser = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isFirebaseConfigured) {
    errorMessage.value = 'Please add your Firebase web app values to the .env file first.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  loading.value = true

  try {
    const credential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    successMessage.value = 'Registration successful for ' + credential.user.email + '.'
    console.log('Registered Firebase user:', {
      uid: credential.user.uid,
      email: credential.user.email
    })
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
        <span class="section-label mb-3">Task 7.1</span>
        <h1 class="h2 mt-3">Firebase registration</h1>
        <p class="text-muted">
          Create a new account with email and password, then verify the user from
          <code>Firebase → Authentication → Users</code>.
        </p>

        <div class="firebase-note rounded-4 p-3 mb-4">
          <strong>Reminder:</strong> open this page in the browser and keep Visual Studio Code open
          for your screenshot set.
        </div>

        <form @submit.prevent="registerUser">
          <div class="mb-3">
            <label for="register-email" class="form-label">Email address</label>
            <input
              id="register-email"
              v-model="email"
              type="email"
              class="form-control"
              placeholder="student@monash.edu"
              required
            />
          </div>

          <div class="mb-3">
            <label for="register-password" class="form-label">Password</label>
            <input
              id="register-password"
              v-model="password"
              type="password"
              class="form-control"
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div class="mb-3">
            <label for="register-confirm-password" class="form-label">Confirm password</label>
            <input
              id="register-confirm-password"
              v-model="confirmPassword"
              type="password"
              class="form-control"
              required
            />
          </div>

          <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>
          <p v-if="successMessage" class="alert alert-success">{{ successMessage }}</p>

          <button class="btn btn-dark" type="submit" :disabled="loading">
            {{ loading ? 'Registering...' : 'Register account' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
