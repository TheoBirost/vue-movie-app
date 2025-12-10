<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
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

    // Animations GSAP
    gsap.from('.actor-photo', {
      opacity: 0,
      scale: 0.9,
      duration: 1,
      ease: 'power3.out'
    })

    gsap.from('.actor-info', {
      opacity: 0,
      y: 50,
      duration: 1,
      delay: 0.2,
      ease: 'power3.out'
    })

    gsap.from('.movie-grid-item', {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.4,
      ease: 'power3.out'
    })
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
  <div class="min-h-screen bg-[#0d0d0f]">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-[80vh]">
      <div class="flex gap-2">
        <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
        <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
    </div>

    <!-- Contenu -->
    <div v-else-if="actor" class="max-w-7xl mx-auto px-6 py-16 space-y-16">
      <!-- Bouton retour -->
      <button
          @click="router.back()"
          class="flex items-center gap-3 text-[#C1C1C7] hover:text-[#FFD700] transition-colors group"
      >
        <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 18-6-6 6-6"/>
        </svg>
        <span class="text-sm tracking-[0.15em] uppercase font-medium">Retour</span>
      </button>

      <!-- En-tête acteur -->
      <div class="grid lg:grid-cols-[350px,1fr] gap-12">
        <!-- Photo -->
        <div class="actor-photo">
          <div class="relative overflow-hidden rounded-lg border border-[#2A2D36]">
            <img
                :src="actor.url || '/default-actor.jpg'"
                :alt="`${actor.firstname} ${actor.lastname}`"
                class="w-full aspect-[2/3] object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
          </div>
        </div>

        <!-- Informations -->
        <div class="actor-info space-y-8">
          <div>
            <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-3">ACTEUR</div>
            <h1 class="garamond text-6xl md:text-7xl font-bold text-white leading-none mb-2">
              {{ actor.firstname }}
            </h1>
            <h2 class="garamond text-5xl md:text-6xl font-bold text-[#FFD700] leading-none mb-6">
              {{ actor.lastname }}
            </h2>
            <div class="h-1 w-32 bg-gradient-to-r from-[#FFD700] to-transparent" />
          </div>

          <div class="flex flex-wrap gap-3">
            <div class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-[#82828A] text-xs uppercase tracking-wider">Naissance</span>
              <p class="text-white font-semibold mt-1">{{ formatDate(actor.dob) }}</p>
            </div>
            <div v-if="actor.dod" class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-[#82828A] text-xs uppercase tracking-wider">Décès</span>
              <p class="text-white font-semibold mt-1">{{ formatDate(actor.dod) }}</p>
            </div>
            <div v-else class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-white font-semibold">En activité</span>
            </div>
          </div>

          <div v-if="actor.bio" class="space-y-4">
            <h3 class="text-[#FFD700] text-sm tracking-[0.2em] uppercase font-semibold">Biographie</h3>
            <p class="text-[#C1C1C7] leading-relaxed text-lg">
              {{ actor.bio }}
            </p>
          </div>
        </div>
      </div>

      <!-- Filmographie -->
      <div v-if="movies.length > 0" class="space-y-8">
        <div>
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-3">FILMOGRAPHIE</div>
          <h2 class="garamond text-4xl md:text-5xl font-bold text-white">
            Films <span class="text-[#FFD700]">({{ movies.length }})</span>
          </h2>
          <div class="h-1 w-24 bg-gradient-to-r from-[#FFD700] to-transparent mt-4" />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div
              v-for="movie in movies"
              :key="movie.id"
              @click="router.push(`/movies/${movie.id}`)"
              class="movie-grid-item"
          >
            <MovieCard :movie="movie" />
          </div>
        </div>
      </div>

      <!-- Empty state filmographie -->
      <div v-else class="text-center py-20">
        <div class="inline-block p-6 bg-[#16181E] rounded-full mb-6">
          <svg class="w-12 h-12 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
          </svg>
        </div>
        <p class="text-[#C1C1C7] text-lg">Aucun film pour cet acteur</p>
      </div>
    </div>

    <!-- État erreur -->
    <div v-else class="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
      <div class="inline-block p-8 bg-[#16181E] rounded-full mb-8">
        <svg class="w-16 h-16 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
      <h2 class="garamond text-3xl font-bold text-white mb-3">Acteur introuvable</h2>
      <p class="text-[#C1C1C7] mb-8">{{ error || 'Cet acteur n\'existe pas ou a été supprimé' }}</p>
      <button
          @click="router.push('/actors')"
          class="px-8 py-4 bg-[#FFD700] hover:bg-[#FFE55C] text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-[0.2em]"
      >
        RETOUR AUX ACTEURS
      </button>
    </div>
  </div>
</template>