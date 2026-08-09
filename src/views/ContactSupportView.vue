<script setup>
import { computed, ref, watch } from 'vue'
import { currentProfile, currentUser } from '@/auth'

const supportEmail = 'bridgewell.support@outlook.com'
const sending = ref(false)
const feedbackMessage = ref('')
const errorMessage = ref('')
const copyMessage = ref('')
const requestReference = ref('')

const form = ref({
  fullName: '',
  email: '',
  subject: 'BridgeWell Health support request',
  message: '',
  preferredReply: 'Email'
})

watch(
  [currentProfile, currentUser],
  () => {
    if (!form.value.fullName && currentProfile.value?.displayName) {
      form.value.fullName = currentProfile.value.displayName
    }

    if (!form.value.email && currentUser.value?.email) {
      form.value.email = currentUser.value.email
    }
  },
  { immediate: true }
)

const draftBody = computed(() =>
  [
    `Name: ${form.value.fullName || 'Not provided'}`,
    `Email: ${form.value.email || 'Not provided'}`,
    `Preferred reply: ${form.value.preferredReply}`,
    '',
    form.value.message.trim() || 'Please describe the support request here.'
  ].join('\n')
)

const mailtoLink = computed(() => {
  const params = new URLSearchParams({
    subject: form.value.subject,
    body: draftBody.value
  })

  return `mailto:${supportEmail}?${params.toString()}`
})

const validateForm = () => {
  if (form.value.fullName.trim().length < 3) {
    throw new Error('Please enter your full name.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email.trim())) {
    throw new Error('Please enter a valid email address.')
  }

  if (form.value.subject.trim().length < 5) {
    throw new Error('Please enter a more specific subject line.')
  }

  if (form.value.message.trim().length < 15) {
    throw new Error('Please describe your support request in at least 15 characters.')
  }
}

const submitToCloudFunction = async () => {
  feedbackMessage.value = ''
  errorMessage.value = ''
  copyMessage.value = ''

  try {
    validateForm()
  } catch (error) {
    errorMessage.value = error.message
    return
  }

  sending.value = true

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: form.value.fullName.trim(),
        email: form.value.email.trim(),
        subject: form.value.subject.trim(),
        message: form.value.message.trim(),
        preferredReply: form.value.preferredReply
      })
    })

    const payload = await response.json()

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || 'The email workflow could not be completed.')
    }

    requestReference.value = payload.referenceId
    feedbackMessage.value = `Support email request prepared successfully. Reference: ${payload.referenceId}`
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    sending.value = false
  }
}

const openMailClient = () => {
  try {
    validateForm()
  } catch (error) {
    errorMessage.value = error.message
    feedbackMessage.value = ''
    return
  }

  window.location.href = mailtoLink.value
  feedbackMessage.value = 'Your default mail client should now open with the pre-filled support email.'
  errorMessage.value = ''
}

const copyDraft = async () => {
  copyMessage.value = ''
  errorMessage.value = ''

  try {
    validateForm()
    await navigator.clipboard.writeText(
      `To: ${supportEmail}\nSubject: ${form.value.subject}\n\n${draftBody.value}`
    )
    copyMessage.value = 'Email draft copied to the clipboard.'
  } catch (error) {
    errorMessage.value = error.message || 'Unable to copy the email draft.'
  }
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Business Requirement D.2</span>
        <h1 class="h2 mt-3">Email the support team</h1>
        <p class="text-muted">
          Use this page to prepare a structured support email, open your mail client, or validate
          the message through the cloud contact workflow before sending.
        </p>

        <div class="status-grid mt-4">
          <div class="status-card">
            <div class="text-muted small mb-2">Support inbox</div>
            <div class="fw-semibold">{{ supportEmail }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Preferred response channel</div>
            <div class="fw-semibold">{{ form.preferredReply }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Cloud workflow reference</div>
            <div class="fw-semibold">{{ requestReference || 'Not generated yet' }}</div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-lg-7">
            <form @submit.prevent="submitToCloudFunction">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="contact-name" class="form-label">Full name</label>
                  <input
                    id="contact-name"
                    v-model="form.fullName"
                    type="text"
                    class="form-control"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="contact-email" class="form-label">Email address</label>
                  <input
                    id="contact-email"
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div class="mb-3">
                <label for="contact-subject" class="form-label">Subject</label>
                <input
                  id="contact-subject"
                  v-model="form.subject"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="contact-message" class="form-label">Message</label>
                <textarea
                  id="contact-message"
                  v-model="form.message"
                  rows="6"
                  class="form-control"
                  placeholder="Describe the request, concern, or outreach need."
                  required
                ></textarea>
                <div class="form-text text-end">{{ form.message.trim().length }}/500</div>
              </div>

              <div class="mb-4">
                <label for="contact-reply" class="form-label">Preferred reply method</label>
                <select id="contact-reply" v-model="form.preferredReply" class="form-select">
                  <option>Email</option>
                  <option>Phone callback</option>
                  <option>Either is fine</option>
                </select>
              </div>

              <p v-if="feedbackMessage" class="alert alert-success">{{ feedbackMessage }}</p>
              <p v-if="copyMessage" class="alert alert-success">{{ copyMessage }}</p>
              <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>

              <div class="d-flex flex-wrap gap-3">
                <button type="submit" class="btn btn-dark" :disabled="sending">
                  {{ sending ? 'Preparing email...' : 'Validate with cloud workflow' }}
                </button>
                <button type="button" class="btn btn-outline-dark" @click="openMailClient">
                  Open mail client
                </button>
                <button type="button" class="btn btn-outline-dark" @click="copyDraft">
                  Copy email draft
                </button>
              </div>
            </form>
          </div>

          <div class="col-lg-5 mt-4 mt-lg-0">
            <div class="status-card h-100">
              <h2 class="h5">Draft preview</h2>
              <p class="text-muted">
                This preview shows the exact message body that will be sent or copied.
              </p>
              <pre class="email-preview">{{ draftBody }}</pre>
              <p class="small text-muted mt-3 mb-0">
                Tip: validate the request first, then use the mail client button in your demo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
