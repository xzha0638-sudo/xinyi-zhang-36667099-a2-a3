<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser } from '@/auth'
import { getCatalog, getMyRating, rateBook } from '@/libraryStore'

const router = useRouter()

const catalog = ref([])
const search = ref('')
const selectedGenre = ref('All')
const feedbackMessage = ref('')
const errorMessage = ref('')
const reviewNotes = ref({})
const selectedRatings = ref({})

const refreshCatalog = () => {
  catalog.value = getCatalog()
}

watch(currentUser, refreshCatalog, { immediate: true })

const genres = computed(() => ['All', ...new Set(catalog.value.map((book) => book.genre))])

const filteredCatalog = computed(() =>
  catalog.value.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.value.toLowerCase()) ||
      book.author.toLowerCase().includes(search.value.toLowerCase()) ||
      book.branch.toLowerCase().includes(search.value.toLowerCase())
    const matchesGenre = selectedGenre.value === 'All' || book.genre === selectedGenre.value
    return matchesSearch && matchesGenre
  })
)

const myRatingFor = (bookId) => getMyRating({ bookId, email: currentUser.value?.email })?.rating || 0

const chosenRatingFor = (bookId) => selectedRatings.value[bookId] || myRatingFor(bookId)

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
        <h1 class="h2 mt-3">Dynamic library catalog</h1>
        <p class="text-muted">
          The catalog below is rendered from structured JSON data. Signed-in members can rate a
          book, and the average updates across the interface.
        </p>

        <div class="row mt-4">
          <div class="col-md-8 mb-3">
            <label class="form-label" for="catalog-search">Search the catalog</label>
            <input
              id="catalog-search"
              v-model="search"
              class="form-control"
              placeholder="Try a title, author, or branch"
            />
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label" for="catalog-genre">Genre</label>
            <select id="catalog-genre" v-model="selectedGenre" class="form-select">
              <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
            </select>
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
                <p class="text-muted mb-2">{{ book.author }} · {{ book.year }} · {{ book.branch }}</p>
              </div>
              <div class="text-end">
                <div class="small text-muted">Avg. rating</div>
                <div class="display-number">{{ book.averageRating || '0.0' }}</div>
                <div class="small text-muted">{{ book.ratingCount }} ratings</div>
              </div>
            </div>

            <p class="mt-3 mb-3">{{ book.summary }}</p>

            <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
              <span class="badge-soft">Copies available: {{ book.availableCopies }}</span>
              <span v-if="book.featured" class="badge-soft badge-highlight">Featured</span>
              <span v-if="myRatingFor(book.id)" class="badge-soft">
                Your rating: {{ myRatingFor(book.id) }}/5
              </span>
            </div>

            <div class="mb-3">
              <div class="small text-muted mb-2">Rate this title</div>
              <div class="star-row">
                <button
                  v-for="star in 5"
                  :key="`${book.id}-${star}`"
                  type="button"
                  class="star-button"
                  :class="{ selected: star <= chosenRatingFor(book.id) }"
                  :aria-label="`Choose ${star} star rating for ${book.title}`"
                  @click="selectedRatings[book.id] = star"
                >
                  ★
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" :for="`note-${book.id}`">Optional short review</label>
              <textarea
                :id="`note-${book.id}`"
                v-model="reviewNotes[book.id]"
                rows="2"
                class="form-control"
                maxlength="160"
                placeholder="Share one short sentence about the book"
              ></textarea>
              <div class="form-text text-end">{{ (reviewNotes[book.id] || '').length }}/160</div>
            </div>

            <button type="button" class="btn btn-dark btn-sm mt-auto" @click="saveRating(book.id)">
              Save rating
            </button>

            <p v-if="book.latestReview" class="small text-muted mb-0">
              Latest review: "{{ book.latestReview }}"
            </p>
          </article>
        </div>

        <p v-if="!filteredCatalog.length" class="alert alert-warning mt-4">
          No catalog records match the current search and filter.
        </p>
      </div>
    </div>
  </section>
</template>
