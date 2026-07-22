<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card form-card p-4 p-md-5 text-center">
        <span class="section-label mb-3">Access denied</span>
        <h1 class="h2 mt-3">Please sign in first</h1>
        <p class="text-muted">
          This page is protected. Sign in with your Firebase account before accessing the role
          portal or logout screen.
        </p>
        <router-link to="/firebase-signin" class="btn btn-dark">Go to sign-in</router-link>
      </div>
    </div>
  </section>
</template>
