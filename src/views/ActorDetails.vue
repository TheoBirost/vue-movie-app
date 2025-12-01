<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '/src/api/api.js'
import MovieCard from '/src/components/MovieCard.vue'

const route = useRoute()
const router = useRouter()
const actor = ref(null)
const movies = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await api.get(`/actors/${route.params.id}`)
    const actorData = res.data

    if (Array.isArray(actorData.movies) && typeof actorData.movies[0] === 'string') {
      const moviePromises = actorData.movies.map(async (iri) => {
        const movieId = iri.match(/\/(\d+)$/)?.[1]
        if (!movieId) return null
        try {
          const movieRes = await api.get(`/movies/${movieId}`)
          return movieRes.data
        } catch {
          return null
        }
      })
      const moviesLoaded = await Promise.all(moviePromises)
      movies.value = moviesLoaded.filter(m => m !== null)
    } else {
      movies.value = actorData.movies || []
    }

    actor.value = actorData
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString) => {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date)) return "—"
  const day = String(date.getDate()).padStart(2,'0')
  const month = String(date.getMonth()+1).padStart(2,'0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}
</script>

<template>
  <div class="min-h-screen bg-color-bg text-color-text">
    <div v-if="loading" class="flex justify-center items-center h-screen">
      <div class="w-16 h-16 border-4 border-color-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="actor" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <button @click="router.back()" class="mb-8 inline-flex items-center gap-2 text-color-text hover:text-color-primary transition-colors" data-aos="fade-right">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Back
      </button>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div class="md:col-span-1" data-aos="zoom-in">
          <img :src="actor.url || '/default_actor.jpeg'" :alt="`${actor.firstname} ${actor.lastname}`" class="w-full h-auto rounded-lg shadow-2xl object-cover">
        </div>

        <div class="md:col-span-2 space-y-6" data-aos="fade-left">
          <h1 class="text-5xl font-gloock font-bold text-color-heading">{{ actor.firstname }} {{ actor.lastname }}</h1>
          <div class="flex items-center space-x-4 text-color-text">
            <span>Born: {{ formatDate(actor.dob) }}</span>
            <span v-if="actor.dod">&bull;</span>
            <span v-if="actor.dod">Died: {{ formatDate(actor.dod) }}</span>
          </div>
          <p class="text-lg leading-relaxed">{{ actor.bio }}</p>
        </div>
      </div>

      <div v-if="movies.length > 0" class="mt-24" data-aos="fade-up">
        <h2 class="text-4xl font-gloock font-bold text-color-heading mb-8">Filmography ({{ movies.length }})</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <MovieCard
            v-for="(movie, index) in movies"
            :key="movie.id"
            :movie="movie"
            @click="router.push(`/movies/${movie.id}`)"
            data-aos="fade-up"
            :data-aos-delay="100 * index"
          />
        </div>
      </div>
      <div v-else class="text-center py-16 text-color-text" data-aos="fade-up">
        <p>No movies found for this actor.</p>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center h-screen text-center" data-aos="fade-up">
      <h2 class="text-3xl font-bold text-color-heading mb-4">Actor Not Found</h2>
      <p class="text-color-text mb-8">{{ error || "We couldn't find the actor you're looking for." }}</p>
      <router-link to="/actors" class="px-6 py-3 bg-color-primary hover:bg-color-primary-accent text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
        Back to Actors
      </router-link>
    </div>
  </div>
</template>
