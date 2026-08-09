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

const selectedResourceId = ref(null)
const resourceFilters = ref({
  title: '',
  author: '',
  genre: '',
  branch: ''
})
const resourceSortKey = ref('title')
const resourceSortDirection = ref('asc')
const resourcePage = ref(1)
const resourcePageSize = 10

const normalize = (value) => String(value ?? '').trim().toLowerCase()

const compareValues = (a, b, key) => {
  const direction = resourceSortDirection.value === 'asc' ? 1 : -1

  if (key === 'year' || key === 'availableCopies' || key === 'averageRating') {
    return ((Number(a[key]) || 0) - (Number(b[key]) || 0)) * direction
  }

  return String(a[key] ?? '')
    .localeCompare(String(b[key] ?? ''), undefined, {
      numeric: true,
      sensitivity: 'base'
    }) * direction
}

const filteredResourceRows = computed(() => {
  const rows = catalog.value.filter((book) => {
    const title = normalize(resourceFilters.value.title)
    const author = normalize(resourceFilters.value.author)
    const genre = normalize(resourceFilters.value.genre)
    const branch = normalize(resourceFilters.value.branch)

    const matchesTitle = !title || normalize(book.title).includes(title)
    const matchesAuthor = !author || normalize(book.author).includes(author)
    const matchesGenre = !genre || normalize(book.genre).includes(genre)
    const matchesBranch = !branch || normalize(book.branch).includes(branch)

    return matchesTitle && matchesAuthor && matchesGenre && matchesBranch
  })

  return rows.sort((first, second) => compareValues(first, second, resourceSortKey.value))
})

const resourcePageCount = computed(() =>
  Math.max(1, Math.ceil(filteredResourceRows.value.length / resourcePageSize))
)

const resourcePageRows = computed(() => {
  const start = (resourcePage.value - 1) * resourcePageSize
  return filteredResourceRows.value.slice(start, start + resourcePageSize)
})

const selectedResource = computed(
  () =>
    catalog.value.find((book) => String(book.id) === String(selectedResourceId.value)) ||
    filteredResourceRows.value[0] ||
    null
)

const clearResourceFilters = () => {
  resourceFilters.value = {
    title: '',
    author: '',
    genre: '',
    branch: ''
  }
  resourcePage.value = 1
}

const toggleResourceSort = (key) => {
  if (resourceSortKey.value === key) {
    resourceSortDirection.value = resourceSortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  resourceSortKey.value = key
  resourceSortDirection.value = 'asc'
}

const resourceSortIndicator = (key) =>
  resourceSortKey.value === key ? (resourceSortDirection.value === 'asc' ? '▲' : '▼') : ''

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

watch(
  filteredResourceRows,
  (rows) => {
    if (resourcePage.value > resourcePageCount.value) {
      resourcePage.value = resourcePageCount.value
    }

    if (!selectedResourceId.value && rows.length) {
      selectedResourceId.value = rows[0].id
    }

    if (
      selectedResourceId.value &&
      !rows.some((book) => String(book.id) === String(selectedResourceId.value))
    ) {
      selectedResourceId.value = rows[0]?.id || null
    }
  },
  { immediate: true }
)

watch(
  resourceFilters,
  () => {
    resourcePage.value = 1
  },
  { deep: true }
)

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

        <div class="content-card p-4 mt-4 dashboard-nested-card">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 class="h5">Interactive resource table</h2>
              <p class="text-muted mb-0">
                This second view supports column search, sortable headers, and a page size of 10 rows.
              </p>
            </div>
            <div class="pagination-group">
              <button type="button" class="btn btn-outline-dark btn-sm" @click="clearResourceFilters">
                Clear column filters
              </button>
              <button type="button" class="btn btn-dark btn-sm" @click="exportVisibleCatalog">
                Export current CSV
              </button>
            </div>
          </div>

          <div class="table-wrap mt-3">
            <table class="table-table">
              <thead>
                <tr>
                  <th><button type="button" @click="toggleResourceSort('title')">Title {{ resourceSortIndicator('title') }}</button></th>
                  <th><button type="button" @click="toggleResourceSort('author')">Author {{ resourceSortIndicator('author') }}</button></th>
                  <th><button type="button" @click="toggleResourceSort('genre')">Topic {{ resourceSortIndicator('genre') }}</button></th>
                  <th><button type="button" @click="toggleResourceSort('branch')">Hub {{ resourceSortIndicator('branch') }}</button></th>
                  <th><button type="button" @click="toggleResourceSort('year')">Year {{ resourceSortIndicator('year') }}</button></th>
                  <th><button type="button" @click="toggleResourceSort('averageRating')">Avg rating {{ resourceSortIndicator('averageRating') }}</button></th>
                  <th><button type="button" @click="toggleResourceSort('availableCopies')">Copies {{ resourceSortIndicator('availableCopies') }}</button></th>
                  <th>Action</th>
                </tr>
                <tr class="filter-row">
                  <th><input v-model="resourceFilters.title" class="form-control" placeholder="Search title" /></th>
                  <th><input v-model="resourceFilters.author" class="form-control" placeholder="Search author" /></th>
                  <th><input v-model="resourceFilters.genre" class="form-control" placeholder="Search topic" /></th>
                  <th><input v-model="resourceFilters.branch" class="form-control" placeholder="Search hub" /></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in resourcePageRows" :key="`table-${book.id}`">
                  <td>{{ book.title }}</td>
                  <td>{{ book.author }}</td>
                  <td>{{ book.genre }}</td>
                  <td>{{ book.branch }}</td>
                  <td>{{ book.year }}</td>
                  <td>{{ book.averageRating || '0.0' }}</td>
                  <td>{{ book.availableCopies }}</td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-outline-dark btn-sm"
                      :class="{ active: selectedResource?.id === book.id }"
                      @click="selectedResourceId = book.id"
                    >
                      Select
                    </button>
                  </td>
                </tr>
                <tr v-if="!resourcePageRows.length">
                  <td colspan="8" class="text-muted">
                    No resources match the current column filters.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-bar mt-3">
            <div class="small text-muted">
              Showing {{ resourcePageRows.length }} row(s) on page {{ resourcePage }} of {{ resourcePageCount }}. Page size: 10.
            </div>
            <div class="pagination-group">
              <button type="button" class="btn btn-outline-dark btn-sm" :disabled="resourcePage === 1" @click="resourcePage -= 1">
                Previous
              </button>
              <button type="button" class="btn btn-outline-dark btn-sm" :disabled="resourcePage === resourcePageCount" @click="resourcePage += 1">
                Next
              </button>
            </div>
          </div>

          <div v-if="selectedResource" class="status-card mt-4">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <div class="section-label mb-2">{{ selectedResource.genre }}</div>
                <h3 class="h5">{{ selectedResource.title }}</h3>
                <p class="text-muted mb-0">
                  {{ selectedResource.author }} · {{ selectedResource.branch }} · {{ selectedResource.year }}
                </p>
              </div>
              <span class="badge-soft">Current average: {{ selectedResource.averageRating || '0.0' }}</span>
            </div>

            <p class="mt-3 mb-3">{{ selectedResource.summary }}</p>

            <div class="star-row mb-3">
              <button
                v-for="star in 5"
                :key="`selected-${selectedResource.id}-${star}`"
                type="button"
                class="star-button"
                :class="{ selected: star <= chosenRatingFor(selectedResource.id) }"
                :aria-label="`Choose ${star} star rating for ${selectedResource.title}`"
                :aria-pressed="star <= chosenRatingFor(selectedResource.id)"
                @click="selectedRatings[selectedResource.id] = star"
              >
                &#9733;
              </button>
            </div>

            <label class="form-label" :for="`table-note-${selectedResource.id}`">Feedback for selected resource</label>
            <textarea
              :id="`table-note-${selectedResource.id}`"
              v-model="reviewNotes[selectedResource.id]"
              rows="2"
              class="form-control"
              maxlength="160"
              placeholder="Write a short note about how useful this resource is"
            ></textarea>
            <div class="form-text text-end">{{ (reviewNotes[selectedResource.id] || '').length }}/160</div>

            <button type="button" class="btn btn-dark btn-sm mt-3" @click="saveRating(selectedResource.id)">
              Save selected resource rating
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
