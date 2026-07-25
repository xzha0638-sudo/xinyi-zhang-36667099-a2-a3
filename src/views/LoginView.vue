<script setup>
import LibraryRegistrationForm from '@/components/LibraryRegistrationForm.vue'
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Business Requirement B</span>
        <h1 class="h2 mt-3">Submit a support or intake request</h1>
        <p class="text-muted">
          This form demonstrates client-side validation and stores support request data in a
          structure that the staff hub can review later.
        </p>
        <div class="mt-4">
          <LibraryRegistrationForm />
        </div>
      </div>
    </div>
  </section>
</template>
