<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { activeRole } from '@/auth'
import { getLibraryStats, getRequestEntries, getRoleLabel, updateRequestStatus } from '@/libraryStore'

const route = useRoute()
const stats = ref(getLibraryStats())
const requests = ref(getRequestEntries())
const selectedStatus = ref('All')
const actionMessage = ref('')
const isStaffHub = computed(() => route.name === 'StaffHub')
const canApproveRequests = computed(() => activeRole.value === 'Manager')
const statusOptions = ['All', 'Pending', 'In review', 'Approved', 'Closed']

const filteredRequests = computed(() =>
  selectedStatus.value === 'All'
    ? requests.value
    : requests.value.filter((request) => request.status === selectedStatus.value)
)

const refreshStaffData = () => {
  stats.value = getLibraryStats()
  requests.value = getRequestEntries()
}

const setRequestStatus = (request, status) => {
  try {
    updateRequestStatus({ id: request.id, status })
    refreshStaffData()
    actionMessage.value = `${request.fullName}'s request is now ${status}.`
  } catch (error) {
    actionMessage.value = error.message
  }
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div v-if="isStaffHub" class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Staff only</span>
        <h1 class="h2 mt-3">Staff Hub</h1>
        <p class="text-muted">
          Support worker and program manager accounts can review community support requests and
          monitor resource activity from this page.
        </p>

        <div class="status-grid mt-4">
          <div class="status-card">
            <div class="text-muted small mb-2">Role in use</div>
            <div class="role-badge">{{ getRoleLabel(activeRole) }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Average rating</div>
            <div class="display-number">{{ stats.averageRating || '0.0' }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Pending requests</div>
            <div class="display-number">{{ stats.pendingRequests }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Reviewed requests</div>
            <div class="display-number">{{ stats.reviewedRequests }}</div>
          </div>
        </div>

        <div class="content-card p-4 mt-4 dashboard-nested-card">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <h2 class="h5">Recent community support requests</h2>
            <div class="status-filter">
              <label for="request-status-filter" class="form-label small mb-1">Status filter</label>
              <select id="request-status-filter" v-model="selectedStatus" class="form-select compact-select">
                <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
              </select>
            </div>
          </div>

          <p v-if="actionMessage" class="alert alert-success mt-3">{{ actionMessage }}</p>

          <div class="table-wrap mt-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Community member</th>
                  <th>Request</th>
                  <th>Hub</th>
                  <th>Status</th>
                  <th>Staff action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in filteredRequests" :key="request.id">
                  <td>
                    <strong>{{ request.fullName }}</strong>
                    <div class="small text-muted">{{ request.email }}</div>
                  </td>
                  <td>{{ request.requestType }}</td>
                  <td>{{ request.branch }}</td>
                  <td><span class="status-pill">{{ request.status }}</span></td>
                  <td>
                    <div class="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="btn btn-outline-dark btn-sm"
                        :disabled="request.status === 'In review'"
                        @click="setRequestStatus(request, 'In review')"
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-dark btn-sm"
                        :disabled="!canApproveRequests || request.status === 'Approved'"
                        @click="setRequestStatus(request, 'Approved')"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-dark btn-sm"
                        :disabled="request.status === 'Closed'"
                        @click="setRequestStatus(request, 'Closed')"
                      >
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredRequests.length">
                  <td colspan="5" class="text-muted">No service requests match this filter.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="small text-muted mt-3 mb-0">
            Program managers can approve requests. Support workers can move requests into review or
            close them after follow-up.
          </p>
        </div>
      </div>

      <div v-else class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Security</span>
        <h1 class="h2 mt-3">Security and validation notes</h1>
        <p class="text-muted">
          This page summarises the main security-conscious decisions built into the BridgeWell
          Health Connect application.
        </p>

        <div class="status-grid mt-4">
          <div class="status-card">
            <h2 class="h5">Protected routes</h2>
            <p class="mb-0">
              Dashboard, logout, and staff-only pages are checked before navigation so anonymous
              visitors cannot open them directly.
            </p>
          </div>
          <div class="status-card">
            <h2 class="h5">Role checks</h2>
            <p class="mb-0">
              Support worker and program manager pages require the stored role attached to the
              signed-in email, not a role chosen on the sign-in screen.
            </p>
          </div>
          <div class="status-card">
            <h2 class="h5">Input handling</h2>
            <p class="mb-0">
              Request text and review notes are normalised before storage so angle-bracket input
              is not kept as raw content.
            </p>
          </div>
          <div class="status-card">
            <h2 class="h5">Workflow limits</h2>
            <p class="mb-0">
              Service requests require contact consent, email format checks, and length limits
              before being saved to browser storage.
            </p>
          </div>
          <div class="status-card">
            <h2 class="h5">Prototype limitation</h2>
            <p class="mb-0">
              Roles and request records are stored locally for this assessment prototype, but staff
              access codes are checked and not retained. A production version would move
              authorisation rules and approval records to a trusted server.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
