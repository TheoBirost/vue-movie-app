<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import api from '/src/api/api.js'
import MovieCard from '../../components/domain/MovieCard.vue'

const route = useRoute()
const router = useRouter()
const actor = ref(null)
const loading = ref(true)

const loadMovieData = async (movieIriOrObject) => {
  if (typeof movieIriOrObject === 'object') return movieIriOrObject

  const id = movieIriOrObject.split('/').pop()
  try {
    const res = await api.get(`/movies/${id}`, {
      params: {
        'groups[]': ['movie:read', 'movie:categories'],
      }
    })
    return res.data
  } catch (e) {
    console.error("Erreur chargement film", id, e)
    return null
  }
}

onMounted(async () => {
  try {
    const res = await api.get(`/actors/${route.params.id}`, {
      params: {
        'groups[]': ['actor:read', 'actor:detail'],
      }
    })
    const actorData = res.data

    if (actorData.movies && actorData.movies.length > 0) {
      const moviesPromises = actorData.movies.map(loadMovieData)
      const loadedMovies = await Promise.all(moviesPromises)
      actorData.movies = loadedMovies.filter(m => m !== null)
    }

    actor.value = actorData

    await nextTick()

    if (document.querySelector('.actor-photo')) {
      gsap.from('.actor-photo', {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'power3.out'
      })
    }

    if (document.querySelector('.actor-info')) {
      gsap.from('.actor-info', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out'
      })
    }

    if (document.querySelectorAll('.movie-grid-item').length > 0) {
      gsap.from('.movie-grid-item', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.4,
        ease: 'power3.out'
      })
    }
  } catch (err) {
    // L'intercepteur global gérera l'affichage de l'erreur 429
    console.error("Erreur lors du chargement de l'acteur :", err);
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
    <div v-if="loading" class="flex items-center justify-center min-h-[80vh]" aria-label="Chargement en cours">
      <div class="flex gap-2">
        <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
        <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
    </div>

    <!-- Contenu -->
    <div v-else-if="actor" class="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <!-- Bouton retour -->
      <button
          @click="router.back()"
          class="flex items-center gap-3 text-[#C1C1C7] hover:text-[#FFD700] transition-colors group"
          aria-label="Retour"
      >
        <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 18-6-6 6-6"/>
        </svg>
        <span class="text-sm tracking-[0.15em] uppercase font-medium">Retour</span>
      </button>

      <!-- En-tête acteur -->
      <div class="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
        <!-- Photo -->
        <div class="actor-photo w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div class="relative overflow-hidden rounded-lg border border-[#2A2D36] shadow-2xl group max-w-[300px] mx-auto md:max-w-none">
            <img
                :src="actor.url || '/default_actor.jpeg'"
                :alt="'Photo de ' + actor.firstname + ' ' + actor.lastname"
                class="w-full h-auto object-cover aspect-[2/3]"
                width="300"
                height="450"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
          </div>
        </div>

        <!-- Informations -->
        <div class="actor-info flex-1 space-y-6">
          <div>
            <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">ACTEUR</div>
            <h1 class="garamond text-5xl md:text-6xl font-bold text-white leading-tight">
              {{ actor.firstname }}
            </h1>
            <h2 class="garamond text-4xl md:text-5xl font-bold text-[#FFD700] leading-tight mb-4">
              {{ actor.lastname }}
            </h2>
            <div class="h-1 w-24 bg-gradient-to-r from-[#FFD700] to-transparent" />
          </div>

          <div class="flex flex-wrap gap-3">
            <div class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-[#82828A] text-[10px] uppercase tracking-wider block mb-1">Naissance</span>
              <p class="text-white font-semibold text-sm">{{ formatDate(actor.dob) }}</p>
            </div>
            <div v-if="actor.dod" class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-[#82828A] text-[10px] uppercase tracking-wider block mb-1">Décès</span>
              <p class="text-white font-semibold text-sm">{{ formatDate(actor.dod) }}</p>
            </div>
          </div>

          <div v-if="actor.bio" class="space-y-2">
            <h3 class="text-[#FFD700] text-xs tracking-[0.2em] uppercase font-bold">Biographie</h3>
            <p class="text-[#C1C1C7] leading-relaxed text-base">
              {{ actor.bio }}
            </p>
          </div>
        </div>
      </div>

      <!-- Filmographie -->
      <div v-if="actor.movies && actor.movies.length > 0" class="space-y-6 pt-8 border-t border-[#2A2D36]">
        <div>
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">FILMOGRAPHIE</div>
          <h2 class="garamond text-3xl md:text-4xl font-bold text-white">
            Films <span class="text-[#FFD700]">({{ actor.movies.length }})</span>
          </h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
              v-for="movie in actor.movies"
              :key="movie.id"
              @click="router.push(`/movies/${movie.id}`)"
              class="movie-grid-item cursor-pointer group"
              @mouseenter="gsap.to($event.currentTarget, { scale: 1.03,  duration: 0.3, ease: 'power2.out' })"
              @mouseleave="gsap.to($event.currentTarget, { scale: 1,  duration: 0.3, ease: 'power2.out' })"
          >
            <MovieCard :movie="movie" />
          </div>
        </div>
      </div>
    </div>


    <div v-else class="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
      <div class="inline-block p-8 bg-[#16181E] rounded-full mb-8">
        <svg class="w-16 h-16 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
      <h2 class="garamond text-3xl font-bold text-white mb-3">Acteur introuvable</h2>
      <p class="text-[#C1C1C7] mb-8">Cet acteur n'existe pas ou a été supprimé</p>
      <button
          @click="router.push('/actors')"
          class="px-8 py-4 bg-[#FFD700] hover:bg-[#FFE55C] text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-[0.2em]"
          aria-label="Retour aux acteurs"
      >
        RETOUR AUX ACTEURS
      </button>
    </div>
  </div>
</template>
