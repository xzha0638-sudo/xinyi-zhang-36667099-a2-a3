<script setup>
import { computed, ref } from 'vue'
import {
  getNearestSupportHub,
  getSupportHubByName,
  supportHubs
} from '@/libraryStore'

const searchTerm = ref('')
const selectedHubName = ref(supportHubs[0].name)
const locationError = ref('')
const locationMessage = ref('Search hubs, choose one, or use your current location to personalise the map.')
const locating = ref(false)
const currentCoords = ref(null)

const filteredHubs = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) {
    return supportHubs
  }

  return supportHubs.filter((hub) =>
    [hub.name, hub.suburb, hub.address, ...(hub.accessibility || [])]
      .join(' ')
      .toLowerCase()
      .includes(term)
  )
})

const selectedHub = computed(() => getSupportHubByName(selectedHubName.value))
const nearestHub = computed(() => getNearestSupportHub(currentCoords.value))

const mapUrl = computed(() => {
  const hub = selectedHub.value
  const latitude = hub.latitude
  const longitude = hub.longitude
  const latitudeDelta = 0.02
  const longitudeDelta = 0.03
  const bbox = [
    longitude - longitudeDelta,
    latitude - latitudeDelta,
    longitude + longitudeDelta,
    latitude + latitudeDelta
  ].join(',')

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`
})

const directionsUrl = computed(() => {
  const hub = selectedHub.value
  return `https://www.google.com/maps/dir/?api=1&destination=${hub.latitude},${hub.longitude}`
})

const chooseHub = (hubName) => {
  selectedHubName.value = hubName
}

const useCurrentLocation = () => {
  locating.value = true
  locationError.value = ''

  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by this browser.'
    locating.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentCoords.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      selectedHubName.value = nearestHub.value.name
      locationMessage.value = `Nearest hub selected from your live location.`
      locating.value = false
    },
    () => {
      locationError.value = 'Location access was denied, so the map is using the manually selected hub.'
      locating.value = false
    },
    {
      enableHighAccuracy: false,
      timeout: 8000
    }
  )
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="content-card p-4 p-md-5">
        <span class="section-label mb-3">Business Requirement E.2</span>
        <h1 class="h2 mt-3">Map and travel support</h1>
        <p class="text-muted">
          This page displays an interactive map, lets users search available support hubs, uses
          geolocation to recommend the nearest hub, and provides a live directions link.
        </p>

        <div class="status-grid mt-4">
          <div class="status-card">
            <div class="text-muted small mb-2">Selected hub</div>
            <div class="fw-semibold">{{ selectedHub.name }}</div>
            <div class="small text-muted mt-2">{{ selectedHub.address }}</div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Current nearest hub</div>
            <div class="fw-semibold">{{ nearestHub.name }}</div>
            <div class="small text-muted mt-2">
              {{ nearestHub.distanceKm !== null ? `${nearestHub.distanceKm} km away` : 'Location not shared yet' }}
            </div>
          </div>
          <div class="status-card">
            <div class="text-muted small mb-2">Map features</div>
            <ul class="library-stat-list mb-0">
              <li>Hub search</li>
              <li>Nearest-hub geolocation</li>
              <li>External directions link</li>
            </ul>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-lg-4">
            <div class="status-card h-100">
              <label class="form-label" for="hub-search">Search support hubs</label>
              <input
                id="hub-search"
                v-model="searchTerm"
                class="form-control"
                placeholder="Search by hub, suburb, or accessibility feature"
              />

              <p class="small text-muted mt-3">{{ locationMessage }}</p>
              <p v-if="locationError" class="alert alert-danger">{{ locationError }}</p>

              <div class="d-flex flex-wrap gap-2 mt-3">
                <button type="button" class="btn btn-dark btn-sm" :disabled="locating" @click="useCurrentLocation">
                  {{ locating ? 'Finding location...' : 'Use my location' }}
                </button>
                <a :href="directionsUrl" target="_blank" rel="noreferrer" class="btn btn-outline-dark btn-sm">
                  Open directions
                </a>
              </div>

              <div class="mt-4">
                <h2 class="h5 mb-3">Available hubs</h2>
                <div class="d-flex flex-column gap-2">
                  <button
                    v-for="hub in filteredHubs"
                    :key="hub.name"
                    type="button"
                    class="btn btn-outline-dark hub-button"
                    :class="{ active: hub.name === selectedHub.name }"
                    @click="chooseHub(hub.name)"
                  >
                    <span class="fw-semibold">{{ hub.name }}</span>
                    <span class="small">{{ hub.suburb }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-8 mt-4 mt-lg-0">
            <div class="status-card h-100">
              <iframe
                class="map-frame"
                :src="mapUrl"
                title="BridgeWell support hub map"
                loading="lazy"
              ></iframe>

              <div class="row mt-4">
                <div class="col-md-6">
                  <h2 class="h5 mb-2">{{ selectedHub.name }}</h2>
                  <p class="text-muted mb-2">{{ selectedHub.address }}</p>
                  <p class="small text-muted mb-0">Suburb: {{ selectedHub.suburb }}</p>
                </div>
                <div class="col-md-6 mt-3 mt-md-0">
                  <h2 class="h5 mb-2">Accessibility features</h2>
                  <ul class="library-stat-list mb-0">
                    <li v-for="item in selectedHub.accessibility" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
