<script setup>
import { computed } from 'vue'
import { activeRole, currentProfile, currentUser } from '@/auth'
import { getRoleLabel } from '@/libraryStore'

const signedIn = computed(() => Boolean(currentUser.value))
const canAccessStaffHub = computed(() => ['Librarian', 'Manager'].includes(activeRole.value))
const roleLabel = computed(() => getRoleLabel(activeRole.value))
</script>

<template>
  <nav class="nav-shell" aria-label="Primary">
    <div class="container py-3">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
        <div>
          <div class="brand-mark fw-bold">BridgeWell Health Connect</div>
          <div class="text-muted small">Migrant wellbeing resources, intake requests, and support roles</div>
        </div>

        <ul class="nav nav-pills gap-2">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/catalog" class="nav-link" active-class="active">Resources</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/join" class="nav-link" active-class="active">Support</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/contact" class="nav-link" active-class="active">Email support</router-link>
          </li>
          <li v-if="!signedIn" class="nav-item">
            <router-link to="/firebase-register" class="nav-link" active-class="active">
              Register
            </router-link>
          </li>
          <li v-if="!signedIn" class="nav-item">
            <router-link to="/firebase-signin" class="nav-link" active-class="active">
              Sign in
            </router-link>
          </li>
          <li v-if="signedIn" class="nav-item">
            <router-link to="/dashboard" class="nav-link" active-class="active">
              Dashboard
            </router-link>
          </li>
          <li v-if="canAccessStaffHub" class="nav-item">
            <router-link to="/staff-hub" class="nav-link" active-class="active">
              Staff Hub
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/security" class="nav-link" active-class="active">
              Security
            </router-link>
          </li>
          <li v-if="signedIn" class="nav-item">
            <router-link to="/firebase-logout" class="nav-link" active-class="active">
              Log out
            </router-link>
          </li>
        </ul>

        <div v-if="signedIn" class="status-card navbar-profile">
          <div class="text-muted small mb-1">Signed in</div>
          <div class="fw-semibold">{{ currentProfile?.displayName || currentUser?.email }}</div>
          <div class="role-badge mt-2">{{ roleLabel }}</div>
        </div>
      </div>
    </div>
  </nav>
</template>
