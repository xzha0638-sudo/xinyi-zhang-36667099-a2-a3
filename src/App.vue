<script setup>
import BHeader from '@/components/BHeader.vue'
</script>

<template>
  <div class="app-shell">
    <BHeader />
    <main class="pb-5">
      <router-view />
    </main>
  </div>
</template>
