<template>
  <section class="page-section">
    <div class="container">
      <div class="hero-card hero-accent">
        <div class="row g-0 align-items-stretch">
          <div class="col-lg-7 p-4 p-md-5">
            <span class="section-label mb-3">Self-paced Lab</span>
            <h1 class="headline mt-3">Mastering user authentication in Vue.js with Firebase</h1>
            <p class="subheadline mt-3 mb-4">
              This project reuses the NoMash Library idea from earlier weeks and adds Firebase
              registration, sign-in, role selection, protected routing, and logout tracking for
              Topic 7.
            </p>

            <div class="d-flex flex-wrap gap-3">
              <router-link to="/firebase-register" class="btn btn-dark btn-lg">
                Open registration page
              </router-link>
              <router-link to="/firebase-signin" class="btn btn-outline-dark btn-lg">
                Open sign-in page
              </router-link>
            </div>
          </div>

          <div class="col-lg-5 p-4 p-md-5">
            <div class="stat-card p-4 h-100">
              <h2 class="h4">Lab checklist</h2>
              <ul class="mt-3 mb-0">
                <li>Firebase project and web app configured</li>
                <li>Authentication enabled with email and password</li>
                <li>Registration page completed</li>
                <li>Sign-in page completed with current user logging</li>
                <li>Role-based sign-in demo completed</li>
                <li>Logout page completed with user state verification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card p-4 p-md-5 mt-4">
        <h2 class="h3">What to screenshot for the submission</h2>
        <div class="status-grid mt-4">
          <div class="status-card">
            <h3 class="h5">Task 7.1</h3>
            <p class="mb-0">
              Registration page, sign-in page with console showing the current user, and the
              Firebase users panel.
            </p>
          </div>
          <div class="status-card">
            <h3 class="h5">Task 7.2</h3>
            <p class="mb-0">
              Sign in with multiple roles on the Role Portal page, then capture the logout page and
              console output.
            </p>
          </div>
          <div class="status-card">
            <h3 class="h5">Quick note</h3>
            <p class="mb-0">
              Replace the placeholder Firebase config values before testing so the forms connect to
              your own Firebase project.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
