<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { activeRole, currentProfile, currentUser, deleteCurrentAccount } from '@/auth'
import { getLibraryStats, getRequestEntries, getRoleLabel } from '@/libraryStore'

const router = useRouter()
const stats = computed(() => getLibraryStats())
const recentRequests = computed(() => getRequestEntries().slice(0, 3))
const deletingAccount = ref(false)
const deleteError = ref('')

const welcomeCopy = computed(() => {
  if (activeRole.value === 'Librarian') {
    return 'You can review community requests, monitor resource activity, and coordinate first-line support follow-up.'
  }

  if (activeRole.value === 'Manager') {
    return 'You can review system-wide request volume, approve staff workflows, and oversee outreach hub activity.'
  }

  return 'You can browse support resources, leave usefulness ratings, and track your wellbeing support activity from one place.'
})

const handleDeleteAccount = async () => {
  const confirmed = window.confirm(
    'Delete this account permanently? Its profile, ratings, and requests will be removed and this cannot be undone.'
  )

  if (!confirmed) {
    return
  }

  deletingAccount.value = true
  deleteError.value = ''

  try {
    await deleteCurrentAccount()
    await router.push({ name: 'Home' })
  } catch (error) {
    deleteError.value =
      error.code === 'auth/requires-recent-login'
        ? 'For security, sign out, sign in again, then retry deleting the account.'
        : error.message
  } finally {
    deletingAccount.value = false
  }
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Protected Page</span>
        <h1 class="h2 mt-3">My Support Dashboard</h1>
        <p class="text-muted mb-4">
          This dashboard is available only after sign-in and shows the role, profile, and support
          activity linked to the current account.
        </p>

        <div class="status-grid">
          <div class="status-card">
            <div class="text-muted small mb-2">Current user</div>
            <div class="fw-semibold">{{ currentUser?.email || 'No user' }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Role</div>
            <div class="role-badge">{{ getRoleLabel(activeRole) }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Preferred support hub</div>
            <div class="fw-semibold small">{{ currentProfile?.favoriteBranch || 'Clayton Hub' }}</div>
          </div>
        </div>

        <div class="firebase-note rounded-4 p-4 mt-4">
          <h2 class="h5">Role overview</h2>
          <p class="mb-0">{{ welcomeCopy }}</p>
        </div>

        <div class="status-grid mt-4">
          <div class="status-card">
            <div class="text-muted small mb-2">Resources in directory</div>
            <div class="display-number">{{ stats.totalResources }}</div>
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
          <router-link to="/catalog" class="btn btn-dark">Browse resources</router-link>
          <router-link to="/join" class="btn btn-outline-dark">Submit a support request</router-link>
          <router-link
            v-if="['Librarian', 'Manager'].includes(activeRole)"
            to="/staff-hub"
            class="btn btn-outline-dark"
          >
            Open staff hub
          </router-link>
          <router-link to="/firebase-logout" class="btn btn-outline-dark">Log out</router-link>
        </div>

        <div class="border-top mt-5 pt-4">
          <h2 class="h5 text-danger">Delete this account</h2>
          <p class="text-muted mb-3">
            Permanently delete the current Firebase account and its local profile, ratings, and requests.
          </p>
          <p v-if="deleteError" class="alert alert-danger">{{ deleteError }}</p>
          <button
            type="button"
            class="btn btn-outline-danger"
            :disabled="deletingAccount"
            @click="handleDeleteAccount"
          >
            {{ deletingAccount ? 'Deleting account...' : 'Delete my account' }}
          </button>
        </div>

        <div v-if="recentRequests.length" class="content-card p-4 mt-4 dashboard-nested-card">
          <h2 class="h5">Recent support requests</h2>
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
