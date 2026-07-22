<script setup>
import { computed } from 'vue'
import { currentUser } from '@/auth'

const signedIn = computed(() => Boolean(currentUser.value))
</script>

<template>
  <nav class="nav-shell">
    <div class="container py-3">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
        <div>
          <div class="brand-mark fw-bold">NoMash Library</div>
          <div class="text-muted small">Topic 7 Lab · Firebase Authentication</div>
        </div>

        <ul class="nav nav-pills gap-2">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/firebase-register" class="nav-link" active-class="active">
              FireRegister
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/firebase-signin" class="nav-link" active-class="active">
              Firebase Sign in
            </router-link>
          </li>
          <li v-if="signedIn" class="nav-item">
            <router-link to="/role-portal" class="nav-link" active-class="active">
              Role Portal
            </router-link>
          </li>
          <li v-if="signedIn" class="nav-item">
            <router-link to="/firebase-logout" class="nav-link" active-class="active">
              Log out
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
