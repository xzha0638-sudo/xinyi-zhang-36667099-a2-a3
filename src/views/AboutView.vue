<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { activeRole } from '@/auth'
import { getLibraryStats, getRequestEntries } from '@/libraryStore'

const route = useRoute()
const stats = computed(() => getLibraryStats())
const requests = computed(() => getRequestEntries())
const isStaffHub = computed(() => route.name === 'StaffHub')
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div v-if="isStaffHub" class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Staff only</span>
        <h1 class="h2 mt-3">Staff Hub</h1>
        <p class="text-muted">
          Librarian and manager accounts can review membership requests and monitor catalog
          activity from this page.
        </p>

        <div class="status-grid mt-4">
          <div class="status-card">
            <div class="text-muted small mb-2">Role in use</div>
            <div class="role-badge">{{ activeRole }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Average rating</div>
            <div class="display-number">{{ stats.averageRating || '0.0' }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Pending requests</div>
            <div class="display-number">{{ stats.totalRequests }}</div>
          </div>
        </div>

        <div class="content-card p-4 mt-4 dashboard-nested-card">
          <h2 class="h5">Recent member and service requests</h2>
          <DataTable :value="requests" table-style="min-width: 100%">
            <Column field="fullName" header="Member" />
            <Column field="requestType" header="Request" />
            <Column field="branch" header="Branch" />
            <Column field="status" header="Status" />
          </DataTable>
        </div>
      </div>

      <div v-else class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Security</span>
        <h1 class="h2 mt-3">Security and validation notes</h1>
        <p class="text-muted">
          This page summarises the main security-conscious decisions built into the NoMash Library
          application.
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
              Librarian and manager pages require the stored role attached to the signed-in email,
              not a role chosen on the sign-in screen.
            </p>
          </div>
          <div class="status-card">
            <h2 class="h5">Input handling</h2>
            <p class="mb-0">
              Request text and review notes are normalised before storage so angle-bracket input
              is not kept as raw content.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
