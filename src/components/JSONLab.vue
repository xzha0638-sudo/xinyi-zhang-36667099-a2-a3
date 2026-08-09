<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser } from '@/auth'
import { getCatalog, getMyRating, rateBook } from '@/libraryStore'
import { downloadCsv } from '@/utils/csv'

const router = useRouter()

const catalog = ref([])
const search = ref('')
const selectedGenre = ref('All')
const availabilityFilter = ref('All')
const feedbackMessage = ref('')
const errorMessage = ref('')
const reviewNotes = ref({})
const selectedRatings = ref({})

const refreshCatalog = () => {
  catalog.value = getCatalog()
}

watch(currentUser, refreshCatalog, { immediate: true })

const genres = computed(() => ['All', ...new Set(catalog.value.map((book) => book.genre))])

const csvRows = computed(() =>
  filteredCatalog.value.map((book) => [
    book.title,
    book.author,
    book.year,
    book.genre,
    book.branch,
    book.availableCopies,
    book.averageRating || '0.0',
    book.featured ? 'Yes' : 'No'
  ])
)

const filteredCatalog = computed(() =>
  catalog.value.filter((book) => {
    const searchTerm = search.value.toLowerCase().trim()
    const searchableText = [
      book.title,
      book.author,
      book.branch,
      book.genre,
      book.summary,
      ...(book.keywords || [])
    ]
      .join(' ')
      .toLowerCase()
    const matchesSearch =
      !searchTerm || searchableText.includes(searchTerm)
    const matchesGenre = selectedGenre.value === 'All' || book.genre === selectedGenre.value
    const matchesAvailability =
      availabilityFilter.value === 'All' ||
      (availabilityFilter.value === 'Available' && book.availableCopies > 0) ||
      (availabilityFilter.value === 'Featured' && book.featured)
    return matchesSearch && matchesGenre && matchesAvailability
  })
)

const myRatingFor = (bookId) => getMyRating({ bookId, email: currentUser.value?.email })?.rating || 0

const chosenRatingFor = (bookId) => selectedRatings.value[bookId] || myRatingFor(bookId)

const clearFilters = () => {
  search.value = ''
  selectedGenre.value = 'All'
  availabilityFilter.value = 'All'
}

const exportVisibleCatalog = () => {
  downloadCsv(
    'bridgewell-resource-directory.csv',
    ['Title', 'Author', 'Year', 'Topic', 'Hub', 'Available copies', 'Average rating', 'Featured'],
    csvRows.value
  )
}

const saveRating = (bookId, rating = selectedRatings.value[bookId]) => {
  feedbackMessage.value = ''
  errorMessage.value = ''

  if (!currentUser.value?.email) {
    router.push({ name: 'FirebaseSignin', query: { redirect: '/catalog', denied: 'true' } })
    return
  }

  try {
    if (!rating) {
      throw new Error('Choose a star rating before saving.')
    }

    rateBook({
      bookId,
      email: currentUser.value.email,
      rating,
      note: reviewNotes.value[bookId] || ''
    })
    selectedRatings.value[bookId] = rating
    reviewNotes.value[bookId] = ''
    feedbackMessage.value = 'Your rating was saved successfully.'
    refreshCatalog()
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Business Requirement B + C.3</span>
        <h1 class="h2 mt-3">Dynamic health resource directory</h1>
        <p class="text-muted">
          The directory below is rendered from structured JSON data. Signed-in community members can
          rate a support resource, and the average updates across the interface.
        </p>

        <div class="row mt-4">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="catalog-search">Search the directory</label>
            <input
              id="catalog-search"
              v-model="search"
              class="form-control"
              placeholder="Try a title, provider, topic, hub, or keyword"
            />
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label" for="catalog-genre">Genre</label>
            <select id="catalog-genre" v-model="selectedGenre" class="form-select">
              <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
            </select>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label" for="catalog-availability">Availability</label>
            <select id="catalog-availability" v-model="availabilityFilter" class="form-select">
              <option>All</option>
              <option>Available</option>
              <option>Featured</option>
            </select>
          </div>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-2">
          <p class="text-muted mb-0">Showing {{ filteredCatalog.length }} of {{ catalog.length }} resources.</p>
          <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-outline-dark btn-sm" @click="clearFilters">
              Clear filters
            </button>
            <button type="button" class="btn btn-dark btn-sm" @click="exportVisibleCatalog">
              Export CSV
            </button>
          </div>
        </div>

        <p v-if="feedbackMessage" class="alert alert-success">{{ feedbackMessage }}</p>
        <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>

        <div class="status-grid mt-4">
          <article v-for="book in filteredCatalog" :key="book.id" class="status-card catalog-card">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <div class="section-label mb-2">{{ book.genre }}</div>
                <h2 class="h5 mb-1">{{ book.title }}</h2>
                <p class="text-muted mb-2">{{ book.author }} - {{ book.year }} - {{ book.branch }}</p>
              </div>
              <div class="text-end">
                <div class="small text-muted">Avg. rating</div>
                <div class="display-number">{{ book.averageRating || '0.0' }}</div>
                <div class="small text-muted">{{ book.ratingCount }} ratings</div>
              </div>
            </div>

            <p class="mt-3 mb-3">{{ book.summary }}</p>

            <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
              <span class="badge-soft">Open places: {{ book.availableCopies }}</span>
              <span v-if="book.featured" class="badge-soft badge-highlight">Featured</span>
              <span v-if="myRatingFor(book.id)" class="badge-soft">
                Your rating: {{ myRatingFor(book.id) }}/5
              </span>
            </div>

            <div class="mb-3">
              <div class="small text-muted mb-2">Rate this resource</div>
              <div class="star-row">
                <button
                  v-for="star in 5"
                  :key="`${book.id}-${star}`"
                  type="button"
                  class="star-button"
                  :class="{ selected: star <= chosenRatingFor(book.id) }"
                  :aria-label="`Choose ${star} star rating for ${book.title}`"
                  :aria-pressed="star <= chosenRatingFor(book.id)"
                  @click="selectedRatings[book.id] = star"
                >
                  &#9733;
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" :for="`note-${book.id}`">Optional short feedback</label>
              <textarea
                :id="`note-${book.id}`"
                v-model="reviewNotes[book.id]"
                rows="2"
                class="form-control"
                maxlength="160"
                placeholder="Share one short sentence about how useful this resource is"
              ></textarea>
              <div class="form-text text-end">{{ (reviewNotes[book.id] || '').length }}/160</div>
            </div>

            <button type="button" class="btn btn-dark btn-sm mt-auto" @click="saveRating(book.id)">
              Save rating
            </button>

            <p v-if="book.latestReview" class="small text-muted mb-0">
              Latest feedback: "{{ book.latestReview }}"
            </p>
          </article>
        </div>

        <p v-if="!filteredCatalog.length" class="alert alert-warning mt-4">
          No resources match the current search and filter.
        </p>
      </div>
    </div>
  </section>
</template>
