<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '/src/api/api.js'
import ActorCard from '/src/components/ActorCard.vue'

const route = useRoute()
const router = useRouter()
const movie = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get(`/movies/${route.params.id}`)
    const movieData = res.data

    if (movieData.releaseDate) {
      const date = new Date(movieData.releaseDate)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      movieData.releaseDate = `${day}-${month}-${year}`
    }

    if (Array.isArray(movieData.actors) && typeof movieData.actors[0] === 'string') {
      const actorPromises = movieData.actors.map(async (iri) => {
        const actorId = iri.match(/\/(\d+)$/)?.[1]
        if (!actorId) return null
        try {
          const actorRes = await api.get(`/actors/${actorId}`)
          return actorRes.data
        } catch {
          return null
        }
      })
      const actorsLoaded = await Promise.all(actorPromises)
      movieData.actors = actorsLoaded.filter(a => a !== null)
    }

    movie.value = movieData
  } catch (err) {
    console.error('Erreur lors du chargement du film :', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[var(--bg-main)]">
    <div v-if="loading" class="flex items-center justify-center min-h-[70vh]">
      <div class="text-[var(--text-gray)] animate-pulse">Chargement...</div>
    </div>

    <div v-else-if="movie" class="max-w-6xl mx-auto px-6 py-12 space-y-12">
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
              :src="movie.url || '/default-film.jpeg'"
              :alt="movie.name"
              class="w-full rounded-[var(--radius)] border border-[var(--border)]"
          />
        </div>

        <div class="flex-1 space-y-4">
          <h1 class="text-5xl font-bold text-white">{{ movie.name }}</h1>

          <p class="text-[var(--text-gray)]">Sortie : {{ movie.releaseDate }}</p>

          <p class="text-[var(--text-white)] leading-relaxed">{{ movie.description }}</p>

          <div class="space-y-2 text-[var(--text-gray)]">
            <p>Budget : {{ movie.budget }} $</p>
            <p>Durée : {{ movie.duration }} minutes</p>
          </div>
        </div>
      </div>

      <div v-if="movie.actors && movie.actors.length > 0">
        <h2 class="text-3xl font-bold text-white mb-6">Acteurs</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
              v-for="actor in movie.actors"
              :key="actor.id"
              @click="router.push(`/actors/${actor.id}`)"
          >
            <ActorCard :actor="actor" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center min-h-[70vh]">
      <p class="text-[var(--text-gray)] mb-6">Film introuvable</p>
      <button
          @click="router.push('/movies')"
          class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black font-semibold rounded-lg transition"
      >
        Retour aux films
      </button>
    </div>
  </div>
</template>