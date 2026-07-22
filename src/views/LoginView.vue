<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../auth'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const errorMessage = ref('')

const submitLogin = () => {
  if (login(username.value, password.value)) {
    router.push(route.query.redirect || { name: 'About' })
    return
  }
  errorMessage.value = 'Incorrect username or password. Please try again.'
}
</script>

<template>
  <section class="container mt-5" style="max-width: 520px">
    <div class="card shadow-sm">
      <div class="card-body p-4">
        <h1 class="h3 mb-3">Member login</h1>
        <p v-if="route.query.denied" class="alert alert-warning">
          Access denied. Please log in to open the members-only About page.
        </p>
        <p class="text-muted">Demo credentials: <code>librarymember</code> / <code>Password123!</code></p>
        <form @submit.prevent="submitLogin">
          <div class="mb-3">
            <label for="login-username" class="form-label">Username</label>
            <input id="login-username" v-model="username" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="login-password" class="form-label">Password</label>
            <input id="login-password" v-model="password" type="password" class="form-control" required />
          </div>
          <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
          <button class="btn btn-primary" type="submit">Log in</button>
        </form>
      </div>
    </div>
  </section>
</template>
