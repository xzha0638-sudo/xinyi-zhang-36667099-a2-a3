<script setup>
import BHeader from '@/components/BHeader.vue'
</script>

<template>
  <div class="app-shell">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <BHeader />
    <main id="main-content" tabindex="-1" class="pb-5">
      <router-view />
    </main>
  </div>
</template>
