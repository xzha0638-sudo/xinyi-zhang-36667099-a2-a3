<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { refreshCurrentProfile } from '@/auth'
import { auth, isFirebaseConfigured } from '@/firebase'
import { registerLibraryProfile, roles } from '@/libraryStore'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const favoriteBranch = ref('Clayton')
const role = ref('Member')
const accessCode = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const registerUser = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isFirebaseConfigured) {
    errorMessage.value = 'Please add your Firebase web app values to the .env file first.'
    return
  }

  if (fullName.value.trim().length < 3) {
    errorMessage.value = 'Please enter your full name.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters.'
    return
  }

  loading.value = true

  try {
    const credential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const profile = registerLibraryProfile({
      email: credential.user.email,
      passwordRole: role.value,
      displayName: fullName.value,
      favoriteBranch: favoriteBranch.value,
      accessCode: accessCode.value
    })
    refreshCurrentProfile()
    successMessage.value = `Account created for ${profile.displayName} as ${profile.role}.`
    setTimeout(() => {
      router.push({ name: 'Dashboard' })
    }, 900)
  } catch (error) {
    errorMessage.value = error.message || error.code + ': ' + error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card form-card p-4 p-md-5">
        <span class="section-label mb-3">Registration</span>
        <h1 class="h2 mt-3">Create a NoMash Library account</h1>
        <p class="text-muted">
          Each account is linked to a library profile. Member access is open, while staff roles
          require an additional access code.
        </p>

        <div class="firebase-note rounded-4 p-3 mb-4">
          <strong>Demo access:</strong> use the staff access code only when you want to create a
          librarian or manager account for role-based testing.
        </div>

        <form @submit.prevent="registerUser">
          <div class="mb-3">
            <label for="register-name" class="form-label">Full name</label>
            <input
              id="register-name"
              v-model="fullName"
              type="text"
              class="form-control"
              placeholder="Xinyi Zhang"
              required
            />
          </div>

          <div class="mb-3">
            <label for="register-email" class="form-label">Email address</label>
            <input
              id="register-email"
              v-model="email"
              type="email"
              class="form-control"
              placeholder="student@monash.edu"
              required
            />
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="register-role" class="form-label">Account role</label>
              <select id="register-role" v-model="role" class="form-select">
                <option v-for="roleOption in roles" :key="roleOption" :value="roleOption">
                  {{ roleOption }}
                </option>
              </select>
            </div>

            <div class="col-md-6 mb-3">
              <label for="register-branch" class="form-label">Home branch</label>
              <select id="register-branch" v-model="favoriteBranch" class="form-select">
                <option>Clayton</option>
                <option>Caulfield</option>
                <option>Peninsula</option>
                <option>Berwick</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label for="register-password" class="form-label">Password</label>
            <input
              id="register-password"
              v-model="password"
              type="password"
              class="form-control"
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div class="mb-3">
            <label for="register-confirm-password" class="form-label">Confirm password</label>
            <input
              id="register-confirm-password"
              v-model="confirmPassword"
              type="password"
              class="form-control"
              required
            />
          </div>

          <div v-if="role !== 'Member'" class="mb-3">
            <label for="register-access-code" class="form-label">Staff access code</label>
            <input
              id="register-access-code"
              v-model="accessCode"
              type="text"
              class="form-control"
              placeholder="Enter the code provided by the manager"
              required
            />
          </div>

          <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>
          <p v-if="successMessage" class="alert alert-success">{{ successMessage }}</p>

          <button class="btn btn-dark" type="submit" :disabled="loading">
            {{ loading ? 'Registering...' : 'Register account' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
