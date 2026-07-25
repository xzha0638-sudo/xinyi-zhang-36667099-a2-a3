<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { refreshCurrentProfile } from '@/auth'
import { auth, isFirebaseConfigured } from '@/firebase'
import { branches, getRoleLabel, registerLibraryProfile, roles } from '@/libraryStore'

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
const errors = ref({
  fullName: null,
  email: null,
  password: null,
  confirmPassword: null,
  accessCode: null
})
const roleOptions = computed(() => roles.map((roleValue) => ({ value: roleValue, label: getRoleLabel(roleValue) })))

const passwordStrength = computed(() => {
  let score = 0
  if (password.value.length >= 8) score += 1
  if (/[A-Z]/.test(password.value)) score += 1
  if (/[0-9]/.test(password.value)) score += 1
  if (/[^A-Za-z0-9]/.test(password.value)) score += 1
  return score
})

const passwordStrengthLabel = computed(() => {
  if (!password.value) return 'Not started'
  if (passwordStrength.value <= 1) return 'Weak'
  if (passwordStrength.value <= 3) return 'Good'
  return 'Strong'
})

const validateField = (field) => {
  if (field === 'fullName') {
    errors.value.fullName = fullName.value.trim().length < 3 ? 'Please enter at least 3 characters.' : null
  }

  if (field === 'email') {
    errors.value.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
      ? null
      : 'Please enter a valid email address.'
  }

  if (field === 'password') {
    errors.value.password = password.value.length >= 8 ? null : 'Password must be at least 8 characters.'
    if (confirmPassword.value) {
      validateField('confirmPassword')
    }
  }

  if (field === 'confirmPassword') {
    errors.value.confirmPassword = password.value === confirmPassword.value ? null : 'Passwords do not match.'
  }

  if (field === 'accessCode') {
    errors.value.accessCode =
      role.value === 'Member' || accessCode.value.trim()
        ? null
        : 'Staff accounts need the correct access code.'
  }
}

watch(role, () => validateField('accessCode'))

const validateForm = () => {
  errors.value = {
    fullName: fullName.value.trim().length < 3 ? 'Please enter at least 3 characters.' : null,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
      ? null
      : 'Please enter a valid email address.',
    password: password.value.length >= 8 ? null : 'Password must be at least 8 characters.',
    confirmPassword: password.value === confirmPassword.value ? null : 'Passwords do not match.',
    accessCode:
      role.value === 'Member' || accessCode.value.trim()
        ? null
        : 'Staff accounts need the correct access code.'
  }

  return Object.values(errors.value).every((error) => !error)
}

const registerUser = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isFirebaseConfigured) {
    errorMessage.value = 'Please add your Firebase web app values to the .env file first.'
    return
  }

  if (!validateForm()) {
    errorMessage.value = 'Please fix the highlighted fields before creating the account.'
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
    successMessage.value = `Account created for ${profile.displayName} as ${getRoleLabel(profile.role)}.`
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
        <h1 class="h2 mt-3">Create a BridgeWell Health account</h1>
        <p class="text-muted">
          Each account is linked to a community support profile. Community member access is open,
          while staff roles require an additional access code.
        </p>

        <div class="firebase-note rounded-4 p-3 mb-4">
          <strong>Demo access:</strong> use the staff access code only when you want to create a
          support worker or program manager account for role-based testing.
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
              @blur="() => validateField('fullName')"
              @input="() => validateField('fullName')"
            />
            <div v-if="errors.fullName" class="text-danger">{{ errors.fullName }}</div>
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
              @blur="() => validateField('email')"
              @input="() => validateField('email')"
            />
            <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="register-role" class="form-label">Account role</label>
              <select id="register-role" v-model="role" class="form-select">
                <option v-for="roleOption in roleOptions" :key="roleOption.value" :value="roleOption.value">
                  {{ roleOption.label }}
                </option>
              </select>
            </div>

            <div class="col-md-6 mb-3">
              <label for="register-branch" class="form-label">Preferred support hub</label>
              <select id="register-branch" v-model="favoriteBranch" class="form-select">
                <option v-for="branch in branches" :key="branch" :value="branch">{{ branch }}</option>
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
              @blur="() => validateField('password')"
              @input="() => validateField('password')"
            />
            <div class="form-text">Strength: {{ passwordStrengthLabel }}</div>
            <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
          </div>

          <div class="mb-3">
            <label for="register-confirm-password" class="form-label">Confirm password</label>
            <input
              id="register-confirm-password"
              v-model="confirmPassword"
              type="password"
              class="form-control"
              required
              @blur="() => validateField('confirmPassword')"
              @input="() => validateField('confirmPassword')"
            />
            <div v-if="errors.confirmPassword" class="text-danger">{{ errors.confirmPassword }}</div>
          </div>

          <div v-if="role !== 'Member'" class="mb-3">
            <label for="register-access-code" class="form-label">Staff access code</label>
            <input
              id="register-access-code"
              v-model="accessCode"
              type="text"
              class="form-control"
              placeholder="Enter the code provided by the staff lead"
              required
              @blur="() => validateField('accessCode')"
              @input="() => validateField('accessCode')"
            />
            <div v-if="errors.accessCode" class="text-danger">{{ errors.accessCode }}</div>
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
