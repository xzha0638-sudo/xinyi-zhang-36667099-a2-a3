<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { activeRole } from '@/auth'
import { getLibraryStats, getRequestEntries, getRoleLabel, updateRequestStatus } from '@/libraryStore'
import { downloadCsv } from '@/utils/csv'

const route = useRoute()
const stats = ref(getLibraryStats())
const requests = ref(getRequestEntries())
const selectedStatus = ref('All')
const actionMessage = ref('')
const exportMessage = ref('')
const isStaffHub = computed(() => route.name === 'StaffHub')
const canApproveRequests = computed(() => activeRole.value === 'Manager')
const statusOptions = ['All', 'Pending', 'In review', 'Approved', 'Closed']
const requestFilters = ref({
  fullName: '',
  email: '',
  requestType: '',
  branch: '',
  status: ''
})
const requestSortKey = ref('createdAt')
const requestSortDirection = ref('desc')
const requestPage = ref(1)
const requestPageSize = 10

const normalize = (value) => String(value ?? '').trim().toLowerCase()

const compareRequests = (a, b, key) => {
  const direction = requestSortDirection.value === 'asc' ? 1 : -1

  if (key === 'createdAt') {
    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction
  }

  return String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base'
  }) * direction
}

const filteredRequests = computed(() =>
  selectedStatus.value === 'All'
    ? requests.value
    : requests.value.filter((request) => request.status === selectedStatus.value)
)

const interactiveRequests = computed(() => {
  const rows = filteredRequests.value.filter((request) => {
    const matchesName =
      !requestFilters.value.fullName || normalize(request.fullName).includes(normalize(requestFilters.value.fullName))
    const matchesEmail =
      !requestFilters.value.email || normalize(request.email).includes(normalize(requestFilters.value.email))
    const matchesType =
      !requestFilters.value.requestType ||
      normalize(request.requestType).includes(normalize(requestFilters.value.requestType))
    const matchesBranch =
      !requestFilters.value.branch || normalize(request.branch).includes(normalize(requestFilters.value.branch))
    const matchesStatus =
      !requestFilters.value.status || normalize(request.status).includes(normalize(requestFilters.value.status))

    return matchesName && matchesEmail && matchesType && matchesBranch && matchesStatus
  })

  return rows.sort((first, second) => compareRequests(first, second, requestSortKey.value))
})

const requestPageCount = computed(() =>
  Math.max(1, Math.ceil(interactiveRequests.value.length / requestPageSize))
)

const requestPageRows = computed(() => {
  const start = (requestPage.value - 1) * requestPageSize
  return interactiveRequests.value.slice(start, start + requestPageSize)
})

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

const exportRequestsCsv = () => {
  downloadCsv(
    'bridgewell-support-requests.csv',
    ['Name', 'Email', 'Request type', 'Hub', 'Status', 'Reason', 'Created at'],
    requests.value.map((request) => [
      request.fullName,
      request.email,
      request.requestType,
      request.branch,
      request.status,
      request.reason,
      request.createdAt
    ])
  )
  exportMessage.value = 'CSV export created successfully.'
}

const toggleRequestSort = (key) => {
  if (requestSortKey.value === key) {
    requestSortDirection.value = requestSortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  requestSortKey.value = key
  requestSortDirection.value = 'asc'
}

const requestSortIndicator = (key) =>
  requestSortKey.value === key ? (requestSortDirection.value === 'asc' ? '▲' : '▼') : ''

const clearRequestFilters = () => {
  requestFilters.value = {
    fullName: '',
    email: '',
    requestType: '',
    branch: '',
    status: ''
  }
  selectedStatus.value = 'All'
  requestPage.value = 1
}

watch(
  [requestFilters, selectedStatus],
  () => {
    requestPage.value = 1
  },
  { deep: true }
)

watch(
  interactiveRequests,
  () => {
    if (requestPage.value > requestPageCount.value) {
      requestPage.value = requestPageCount.value
    }
  },
  { immediate: true }
)
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
          <p v-if="exportMessage" class="alert alert-success mt-3">{{ exportMessage }}</p>
          <div class="table-toolbar mt-3">
            <input v-model="requestFilters.fullName" class="form-control" placeholder="Search member" />
            <input v-model="requestFilters.email" class="form-control" placeholder="Search email" />
            <input v-model="requestFilters.requestType" class="form-control" placeholder="Search request type" />
            <input v-model="requestFilters.branch" class="form-control" placeholder="Search hub" />
            <input v-model="requestFilters.status" class="form-control" placeholder="Search status" />
            <button type="button" class="btn btn-outline-dark btn-sm" @click="clearRequestFilters">
              Clear filters
            </button>
            <button type="button" class="btn btn-dark btn-sm" @click="exportRequestsCsv">
              Export requests CSV
            </button>
          </div>

          <div class="table-wrap mt-3">
            <table class="table-table">
              <thead>
                <tr>
                  <th><button type="button" @click="toggleRequestSort('fullName')">Community member {{ requestSortIndicator('fullName') }}</button></th>
                  <th><button type="button" @click="toggleRequestSort('requestType')">Request {{ requestSortIndicator('requestType') }}</button></th>
                  <th><button type="button" @click="toggleRequestSort('branch')">Hub {{ requestSortIndicator('branch') }}</button></th>
                  <th><button type="button" @click="toggleRequestSort('status')">Status {{ requestSortIndicator('status') }}</button></th>
                  <th>Staff action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in requestPageRows" :key="request.id">
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
                <tr v-if="!requestPageRows.length">
                  <td colspan="5" class="text-muted">No service requests match this filter.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-bar mt-3">
            <div class="small text-muted">
              Showing {{ requestPageRows.length }} row(s) on page {{ requestPage }} of {{ requestPageCount }}. Page size: 10.
            </div>
            <div class="pagination-group">
              <button type="button" class="btn btn-outline-dark btn-sm" :disabled="requestPage === 1" @click="requestPage -= 1">
                Previous
              </button>
              <button type="button" class="btn btn-outline-dark btn-sm" :disabled="requestPage === requestPageCount" @click="requestPage += 1">
                Next
              </button>
            </div>
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
