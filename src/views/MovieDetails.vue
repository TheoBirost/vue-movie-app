<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
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

    // Animations GSAP
    gsap.from('.movie-poster', {
      opacity: 0,
      x: -100,
      duration: 1,
      ease: 'power3.out'
    })

    gsap.from('.movie-info', {
      opacity: 0,
      x: 100,
      duration: 1,
      delay: 0.2,
      ease: 'power3.out'
    })

    gsap.from('.actor-grid-item', {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.4,
      ease: 'power3.out'
    })
  } catch (err) {
    console.error('Erreur lors du chargement du film :', err)
  } finally {
    loading.value = false
  }
})
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
    <div v-else-if="movie" class="max-w-7xl mx-auto px-6 py-16 space-y-16">
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

      <!-- En-tête du film -->
      <div class="grid lg:grid-cols-[400px,1fr] gap-12">
        <!-- Poster -->
        <div class="movie-poster">
          <div class="relative overflow-hidden rounded-lg border border-[#2A2D36] group">
            <img
                :src="movie.url || '/default-film.jpeg'"
                :alt="movie.name"
                class="w-full aspect-[2/3] object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          </div>
        </div>

        <!-- Informations -->
        <div class="movie-info space-y-8">
          <div>
            <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-3">FILM</div>
            <h1 class="garamond text-6xl md:text-7xl font-bold text-white leading-none mb-6">
              {{ movie.name }}
            </h1>
            <div class="h-1 w-32 bg-gradient-to-r from-[#FFD700] to-transparent mb-8" />
          </div>

          <div class="flex flex-wrap gap-3">
            <div class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-[#82828A] text-xs uppercase tracking-wider">Sortie</span>
              <p class="text-white font-semibold mt-1">{{ movie.releaseDate }}</p>
            </div>
            <div class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-[#82828A] text-xs uppercase tracking-wider">Durée</span>
              <p class="text-white font-semibold mt-1">{{ movie.duration }} min</p>
            </div>
            <div class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-[#82828A] text-xs uppercase tracking-wider">Budget</span>
              <p class="text-white font-semibold mt-1">{{ movie.budget?.toLocaleString() }} $</p>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-[#FFD700] text-sm tracking-[0.2em] uppercase font-semibold">Synopsis</h3>
            <p class="text-[#C1C1C7] leading-relaxed text-lg">
              {{ movie.description }}
            </p>
          </div>

          <div v-if="movie.categories?.length" class="space-y-4">
            <h3 class="text-[#FFD700] text-sm tracking-[0.2em] uppercase font-semibold">Genres</h3>
            <div class="flex flex-wrap gap-2">
              <span
                  v-for="category in movie.categories"
                  :key="category.id"
                  class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg text-white hover:border-[#FFD700] hover:text-[#FFD700] transition-colors text-sm"
              >
                {{ category.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribution -->
      <div v-if="movie.actors && movie.actors.length > 0" class="space-y-8">
        <div>
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-3">DISTRIBUTION</div>
          <h2 class="garamond text-4xl md:text-5xl font-bold text-white">Acteurs</h2>
          <div class="h-1 w-24 bg-gradient-to-r from-[#FFD700] to-transparent mt-4" />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div
              v-for="actor in movie.actors"
              :key="actor.id"
              @click="router.push(`/actors/${actor.id}`)"
              class="actor-grid-item"
          >
            <ActorCard :actor="actor" />
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
      <div class="inline-block p-8 bg-[#16181E] rounded-full mb-8">
        <svg class="w-16 h-16 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
        </svg>
      </div>
      <h2 class="garamond text-3xl font-bold text-white mb-3">Film introuvable</h2>
      <p class="text-[#C1C1C7] mb-8">Ce film n'existe pas ou a été supprimé</p>
      <button
          @click="router.push('/movies')"
          class="px-8 py-4 bg-[#FFD700] hover:bg-[#FFE55C] text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-[0.2em]"
      >
        RETOUR AUX FILMS
      </button>
    </div>
  </div>
</template>