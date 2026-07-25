<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card form-card p-4 p-md-5 text-center">
        <span class="section-label mb-3">Access denied</span>
        <h1 class="h2 mt-3">
          {{ route.query.reason === 'role' ? 'Your account does not have access to that page.' : 'Please sign in first.' }}
        </h1>
        <p class="text-muted">
          {{
            route.query.reason === 'role'
              ? 'The page you requested is limited to staff roles. Use an account with support worker or program manager access.'
              : 'This page is protected. Sign in with your support account before continuing.'
          }}
        </p>
        <div class="d-flex justify-content-center gap-3 mt-4">
          <router-link to="/firebase-signin" class="btn btn-dark">Go to sign-in</router-link>
          <router-link to="/catalog" class="btn btn-outline-dark">Back to resources</router-link>
        </div>
      </div>
    </div>
  </section>
</template>
