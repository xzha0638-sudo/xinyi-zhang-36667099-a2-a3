<script setup>
import { computed } from 'vue'
import { currentProfile, currentUser } from '@/auth'
import { getLibraryStats, getRoleLabel } from '@/libraryStore'

const stats = computed(() => getLibraryStats())
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="hero-card hero-accent">
        <div class="row g-0 align-items-stretch">
          <div class="col-lg-7 p-4 p-md-5">
            <span class="section-label mb-3">Health Charity Platform</span>
            <h1 class="headline mt-3">Find trusted wellbeing support for migrant communities in one place.</h1>
            <p class="subheadline mt-3 mb-4">
              BridgeWell Health Connect combines account registration, role-based support access,
              dynamic resource data, and a community rating system for multilingual health support.
            </p>

            <div class="d-flex flex-wrap gap-3">
              <router-link to="/catalog" class="btn btn-dark btn-lg">Browse resources</router-link>
              <router-link to="/join" class="btn btn-outline-dark btn-lg">
                Request support
              </router-link>
              <router-link
                v-if="!currentUser"
                to="/firebase-register"
                class="btn btn-outline-dark btn-lg"
              >
                Create account
              </router-link>
              <router-link v-else to="/dashboard" class="btn btn-outline-dark btn-lg">
                Open dashboard
              </router-link>
            </div>
          </div>

          <div class="col-lg-5 p-4 p-md-5">
            <div class="stat-card p-4 h-100">
              <h2 class="h4">Application snapshot</h2>
              <ul class="mt-3 mb-0 library-stat-list">
                <li><strong>{{ stats.totalResources }}</strong> support resources across outreach hubs</li>
                <li><strong>{{ stats.featuredResources }}</strong> featured resources on the directory page</li>
                <li><strong>{{ stats.totalRatings }}</strong> community usefulness ratings recorded</li>
                <li><strong>{{ stats.averageRating || '0.0' }}</strong> current resource average</li>
                <li><strong>{{ stats.totalRequests }}</strong> support or intake requests logged</li>
                <li v-if="currentProfile">
                  Signed in as <strong>{{ currentProfile.displayName }}</strong> ({{ getRoleLabel(currentProfile.role) }})
                </li>
                <li v-else>Sign in to rate resources and unlock staff-only pages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card p-4 p-md-5 mt-4">
        <h2 class="h3">How the app maps to the business requirements</h2>
        <div class="status-grid mt-4">
          <div class="status-card">
            <h3 class="h5">Authentication</h3>
            <p class="mb-0">
              Firebase email/password accounts are linked to stored support profiles and preferred
              outreach hubs.
            </p>
          </div>
          <div class="status-card">
            <h3 class="h5">Role access</h3>
            <p class="mb-0">
              Community members, support workers, and program managers see different navigation and
              protected routes.
            </p>
          </div>
          <div class="status-card">
            <h3 class="h5">Ratings & data</h3>
            <p class="mb-0">
              Directory resources are loaded from JSON and each signed-in user can leave one rating
              per support resource.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
