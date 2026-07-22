<script setup>
import { computed } from 'vue'
import { activeRole, currentProfile, currentUser } from '@/auth'
import { getLibraryStats, getRequestEntries } from '@/libraryStore'

const stats = computed(() => getLibraryStats())
const recentRequests = computed(() => getRequestEntries().slice(0, 3))

const welcomeCopy = computed(() => {
  if (activeRole.value === 'Librarian') {
    return 'You can review member requests, observe catalog activity, and support borrowing services.'
  }

  if (activeRole.value === 'Manager') {
    return 'You can review system-wide request volume, approve staff workflows, and oversee branch activity.'
  }

  return 'You can browse the catalog, leave ratings, and track your library activity from one place.'
})
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Protected Page</span>
        <h1 class="h2 mt-3">My Library Dashboard</h1>
        <p class="text-muted mb-4">
          This dashboard is available only after sign-in and shows the role, profile, and activity
          linked to the current account.
        </p>

        <div class="status-grid">
          <div class="status-card">
            <div class="text-muted small mb-2">Current user</div>
            <div class="fw-semibold">{{ currentUser?.email || 'No user' }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Role</div>
            <div class="role-badge">{{ activeRole || 'Member' }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Home branch</div>
            <div class="fw-semibold small">{{ currentProfile?.favoriteBranch || 'Clayton' }}</div>
          </div>
        </div>

        <div class="firebase-note rounded-4 p-4 mt-4">
          <h2 class="h5">Role overview</h2>
          <p class="mb-0">{{ welcomeCopy }}</p>
        </div>

        <div class="status-grid mt-4">
          <div class="status-card">
            <div class="text-muted small mb-2">Books in catalog</div>
            <div class="display-number">{{ stats.totalBooks }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Ratings submitted</div>
            <div class="display-number">{{ stats.totalRatings }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Open requests</div>
            <div class="display-number">{{ stats.totalRequests }}</div>
          </div>
        </div>

        <div class="mt-4 d-flex flex-wrap gap-3">
          <router-link to="/catalog" class="btn btn-dark">Browse catalog</router-link>
          <router-link to="/join" class="btn btn-outline-dark">Submit a new request</router-link>
          <router-link
            v-if="['Librarian', 'Manager'].includes(activeRole)"
            to="/staff-hub"
            class="btn btn-outline-dark"
          >
            Open staff hub
          </router-link>
          <router-link to="/firebase-logout" class="btn btn-outline-dark">Log out</router-link>
        </div>

        <div v-if="recentRequests.length" class="content-card p-4 mt-4 dashboard-nested-card">
          <h2 class="h5">Recent service requests</h2>
          <ul class="request-preview-list mt-3 mb-0">
            <li v-for="request in recentRequests" :key="request.id">
              <strong>{{ request.fullName }}</strong> requested <strong>{{ request.requestType }}</strong>
              for <strong>{{ request.branch }}</strong>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
