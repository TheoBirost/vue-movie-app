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
  <div class="min-h-screen bg-[var(--bg-main)]">
    <div v-if="loading" class="flex items-center justify-center min-h-[70vh]">
      <div class="text-[var(--text-gray)] animate-pulse">Chargement...</div>
    </div>

    <div v-else-if="actor" class="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <button
          @click="router.back()"
          class="flex items-center gap-2 text-[var(--text-gray)] hover:text-[var(--gold)] transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Retour
      </button>

      <div class="flex gap-8">
        <div class="w-64 flex-shrink-0">
          <img
              :src="actor.url || '/default-actor.jpg'"
              :alt="`${actor.firstname} ${actor.lastname}`"
              class="w-full rounded-[var(--radius)] border border-[var(--border)]"
          />
        </div>

        <div class="flex-1 space-y-4">
          <h1 class="text-5xl font-bold text-white">{{ actor.firstname }} {{ actor.lastname }}</h1>

          <p class="text-[var(--text-white)] leading-relaxed">{{ actor.bio }}</p>

          <div class="space-y-2 text-[var(--text-gray)]">
            <p>Né(e) le {{ formatDate(actor.dob) }}</p>
            <p v-if="actor.dod">Décédé(e) le {{ formatDate(actor.dod) }}</p>
            <p v-else>Toujours en vie</p>
          </div>
        </div>
      </div>

      <div v-if="movies.length > 0">
        <h2 class="text-3xl font-bold text-white mb-6">Films ({{ movies.length }})</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
              v-for="movie in movies"
              :key="movie.id"
              @click="router.push(`/movies/${movie.id}`)"
          >
            <MovieCard :movie="movie" />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-[var(--text-gray)]">Aucun film pour cet acteur</p>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center min-h-[70vh]">
      <p class="text-[var(--text-gray)] mb-6">{{ error || 'Acteur introuvable' }}</p>
      <button
          @click="router.push('/actors')"
          class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black font-semibold rounded-lg transition"
      >
        Retour aux acteurs
      </button>
    </div>
  </div>
</template>