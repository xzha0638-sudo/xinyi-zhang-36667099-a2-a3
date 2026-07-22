<script setup>
import { computed, ref } from 'vue'

import authors from '@/assets/json/authors.json'
import bookstores from '@/assets/json/bookstores.json'

const showMessage = ref(false)

const modernAuthors = computed(() => authors.filter((author) => author.birthYear > 1850))
const allFamousWorks = computed(() => authors.flatMap((author) => author.famousWorks))
const orwell = computed(() => authors.find((author) => author.name === 'George Orwell'))
const austen = computed(() => authors.find((author) => author.id === 1))
const booksByAusten = computed(() => authors.find((author) => author.id === 1)?.famousWorks ?? [])
const companyName = computed(() => bookstores.name)
const totalStores = computed(() => bookstores.totalStores)
const storeTypes = computed(() => bookstores.storeTypes)
const openingHours = computed(() => bookstores.openingHours)
const countriesOperated = computed(() => bookstores.countries.join(', '))
const topSellers = computed(() => bookstores.topSellers.join(', '))

const toggleMessage = () => {
  showMessage.value = !showMessage.value
}
</script>

<template>
  <div class="json-lab">
    <h1>W2 JSON Data and Vue Directives Lab</h1>

    <section class="lab-section">
      <h2>Working with JSON Arrays</h2>
      <p>Our <code>authors.json</code> contains an array of author objects.</p>

      <h3>Iterating Through Arrays</h3>
      <ul>
        <li v-for="author in authors" :key="author.id">
          {{ author.name }} ({{ author.birthYear }})
        </li>
      </ul>

      <h3>Filtering Arrays</h3>
      <p>Authors born after 1850:</p>
      <ul>
        <li v-for="author in modernAuthors" :key="author.id">
          {{ author.name }} ({{ author.birthYear }})
        </li>
      </ul>

      <h3>Mapping Arrays</h3>
      <p>Famous works:</p>
      <ul>
        <li v-for="work in allFamousWorks" :key="`${work.title}-${work.year}`">
          {{ work.title }} ({{ work.year }})
        </li>
      </ul>

      <h3>Finding in Arrays</h3>
      <p>Finding by property: {{ orwell?.name }}</p>

      <h3>Nested Arrays and Objects</h3>
      <p>{{ austen?.name }}'s works:</p>
      <ul>
        <li v-for="work in booksByAusten" :key="`${work.title}-${work.year}`">
          {{ work.title }} ({{ work.year }})
        </li>
      </ul>
    </section>

    <section class="lab-section">
      <h2>Working with JSON Objects</h2>
      <p>Our <code>bookstores.json</code> is a JSON object.</p>

      <h3>Accessing Properties</h3>
      <p>Company: {{ companyName }}</p>
      <p>Total Stores: {{ totalStores }}</p>

      <h3>Iterating Object Properties</h3>
      <ul>
        <li v-for="storeType in storeTypes" :key="storeType.type">
          {{ storeType.type }}: {{ storeType.count }}
        </li>
      </ul>

      <h3>Nested Objects</h3>
      <p>Weekdays: {{ openingHours.weekdays.open }} - {{ openingHours.weekdays.close }}</p>
      <p>Weekends: {{ openingHours.weekends.open }} - {{ openingHours.weekends.close }}</p>

      <h3>Working with Arrays in Objects</h3>
      <p>We operate in: {{ countriesOperated }}</p>
      <p>Our top sellers: {{ topSellers }}</p>
    </section>

    <section class="lab-section">
      <h2>v-if and v-else</h2>
      <p>Toggle visibility based on a condition.</p>
      <button class="btn btn-outline-primary" @click="toggleMessage">Toggle Message</button>
      <p v-if="showMessage" class="message success">You're a Vue superstar!</p>
      <p v-else>Click the button to see a message.</p>
    </section>

    <section class="lab-section">
      <h2>Attribute, Class and Style Binding with <code>v-bind</code></h2>
      <p>Authors born after 1900 are highlighted below.</p>
      <ul>
        <li
          v-for="author in authors"
          :key="`highlight-${author.id}`"
          :class="{ highlight: author.birthYear > 1900 }"
        >
          {{ author.name }} ({{ author.birthYear }})
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.json-lab {
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1,
h2 {
  color: #333;
}

h1 {
  text-align: center;
}

.lab-section {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message {
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}

.success {
  background-color: #e7faf3;
  color: #42b883;
  border: 1px solid #42b883;
}

.highlight {
  background-color: #d9f6e9;
}

code {
  background-color: #e0e0e0;
  padding: 2px 5px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #f0f0f0;
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
}
</style>
