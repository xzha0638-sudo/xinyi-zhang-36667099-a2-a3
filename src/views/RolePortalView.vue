<script setup>
import { computed } from 'vue'
import { activeRole, currentUser } from '@/auth'

const welcomeCopy = computed(() => {
  if (activeRole.value === 'Librarian') {
    return 'You can review borrowing activity and support reader accounts.'
  }

  if (activeRole.value === 'Manager') {
    return 'You can monitor the wider system and review account activity.'
  }

  return 'You can browse your library profile and continue the authentication demo.'
})
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Protected Page</span>
        <h1 class="h2 mt-3">Role Portal</h1>
        <p class="text-muted mb-4">
          This page helps you capture the Distinction / High Distinction screenshot showing the
          signed-in account and multiple roles in the system.
        </p>

        <div class="status-grid">
          <div class="status-card">
            <div class="text-muted small mb-2">Current user</div>
            <div class="fw-semibold">{{ currentUser?.email || 'No user' }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Selected role</div>
            <div class="role-badge">{{ activeRole || 'No role selected' }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Firebase UID</div>
            <div class="fw-semibold small">{{ currentUser?.uid || 'N/A' }}</div>
          </div>
        </div>

        <div class="firebase-note rounded-4 p-4 mt-4">
          <h2 class="h5">Role explanation</h2>
          <p class="mb-0">
            {{ welcomeCopy }}
          </p>
        </div>

        <div class="mt-4">
          <router-link to="/firebase-signin" class="btn btn-outline-dark me-2">
            Change role and sign in again
          </router-link>
          <router-link to="/firebase-logout" class="btn btn-dark">Go to logout page</router-link>
        </div>
      </div>
    </div>
  </section>
</template>
