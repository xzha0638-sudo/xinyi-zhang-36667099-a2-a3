<script setup>
import { onMounted, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { getRequestEntries, submitLibraryRequest } from '@/libraryStore'

const formData = ref({
  fullName: '',
  email: '',
  branch: 'Clayton',
  requestType: 'Membership application',
  reason: '',
  agreeToContact: false
})

const errors = ref({
  fullName: null,
  email: null,
  reason: null
})
const feedbackMessage = ref('')
const errorMessage = ref('')
const requests = ref([])

const validateFullName = (blur) => {
  if (formData.value.fullName.trim().length < 3) {
    if (blur) errors.value.fullName = 'Full name must be at least 3 characters.'
  } else {
    errors.value.fullName = null
  }
}

const validateEmail = (blur) => {
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
  if (!validEmail) {
    if (blur) errors.value.email = 'Please enter a valid email address.'
  } else {
    errors.value.email = null
  }
}

const validateReason = (blur) => {
  if (formData.value.reason.trim().length < 15) {
    if (blur) errors.value.reason = 'Reason must be at least 15 characters.'
  } else {
    errors.value.reason = null
  }
}

const clearForm = () => {
  formData.value = {
    fullName: '',
    email: '',
    branch: 'Clayton',
    requestType: 'Membership application',
    reason: '',
    agreeToContact: false
  }
  errors.value = { fullName: null, email: null, reason: null }
}

const refreshRequests = () => {
  requests.value = getRequestEntries()
}

const submitForm = () => {
  feedbackMessage.value = ''
  errorMessage.value = ''

  validateFullName(true)
  validateEmail(true)
  validateReason(true)

  if (!errors.value.fullName && !errors.value.email && !errors.value.reason) {
    try {
      submitLibraryRequest({
        fullName: formData.value.fullName,
        email: formData.value.email,
        branch: formData.value.branch,
        requestType: formData.value.requestType,
        reason: formData.value.reason
      })
      feedbackMessage.value = 'Your request has been recorded for staff review.'
      refreshRequests()
      clearForm()
    } catch (error) {
      errorMessage.value = error.message
    }
  }
}

onMounted(refreshRequests)
</script>

<template>
  <div class="row">
    <div class="col-lg-7">
      <form @submit.prevent="submitForm" novalidate>
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="request-name" class="form-label">Full name</label>
            <input
              id="request-name"
              v-model="formData.fullName"
              class="form-control"
              @blur="() => validateFullName(true)"
              @input="() => validateFullName(false)"
            />
            <div v-if="errors.fullName" class="text-danger">{{ errors.fullName }}</div>
          </div>

          <div class="col-md-6">
            <label for="request-email" class="form-label">Email address</label>
            <input
              id="request-email"
              v-model="formData.email"
              type="email"
              class="form-control"
              @blur="() => validateEmail(true)"
              @input="() => validateEmail(false)"
            />
            <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label for="request-type" class="form-label">Request type</label>
            <select id="request-type" v-model="formData.requestType" class="form-select">
              <option>Membership application</option>
              <option>Suggest a new book</option>
              <option>Study room enquiry</option>
              <option>Volunteer interest</option>
            </select>
          </div>
          <div class="col-md-6">
            <label for="request-branch" class="form-label">Preferred branch</label>
            <select id="request-branch" v-model="formData.branch" class="form-select">
              <option>Clayton</option>
              <option>Caulfield</option>
              <option>Peninsula</option>
              <option>Berwick</option>
            </select>
          </div>
        </div>

        <div class="mb-3">
          <label for="request-reason" class="form-label">Reason or details</label>
          <textarea
            id="request-reason"
            v-model="formData.reason"
            class="form-control"
            rows="4"
            @blur="() => validateReason(true)"
            @input="() => validateReason(false)"
          ></textarea>
          <div class="form-text">Include enough detail for the staff team to act on your request.</div>
          <div v-if="errors.reason" class="text-danger">{{ errors.reason }}</div>
        </div>

        <div class="form-check mb-4">
          <input
            id="request-contact"
            v-model="formData.agreeToContact"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label" for="request-contact">
            I agree to be contacted about this request.
          </label>
        </div>

        <p v-if="feedbackMessage" class="alert alert-success">{{ feedbackMessage }}</p>
        <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>

        <div class="d-flex flex-wrap gap-3">
          <button type="submit" class="btn btn-dark">Submit request</button>
          <button type="button" class="btn btn-outline-dark" @click="clearForm">Clear</button>
        </div>
      </form>
    </div>

    <div class="col-lg-5 mt-4 mt-lg-0">
      <div class="status-card h-100">
        <h2 class="h5">Recent requests</h2>
        <p class="text-muted">
          Requests are stored in the browser for this prototype so staff can review them from the
          protected hub.
        </p>
        <DataTable :value="requests" table-style="min-width: 100%">
          <Column field="fullName" header="Name" />
          <Column field="requestType" header="Type" />
          <Column field="status" header="Status" />
        </DataTable>
      </div>
    </div>
  </div>
</template>
