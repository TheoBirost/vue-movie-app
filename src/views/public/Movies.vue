<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useDataStore } from '../../stores/useDataStore'
import MovieCard from "../../components/domain/MovieCard.vue"
import api from '/src/api/api.js'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()

const search = ref("")
const page = ref(1)
const loading = ref(false)
const movies = ref([])
const totalItems = ref(0)
const categoryName = ref("")

const limit = 12

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(totalItems.value / limit));
});

const fetchMovies = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      itemsPerPage: limit,
      'groups[]': ['movie:read', 'movie:categories']
    }

    // Si une catégorie est sélectionnée dans l'URL
    if (route.query.category) {
      params['categories.id'] = route.query.category

      // Récupérer le nom de la catégorie pour le titre
      try {
        const catRes = await api.get(`/categories/${route.query.category}`)
        categoryName.value = catRes.data.name
      } catch (e) {
        console.error("Erreur récupération catégorie", e)
      }
    } else {
      categoryName.value = ""
    }

    // Si une recherche textuelle est active (prioritaire sur le store pour la recherche globale)
    if (search.value) {
      params['name'] = search.value
    }

    const response = await api.get('/movies', { params })
    const data = response.data
    movies.value = data['hydra:member'] || data['member'] || []
    totalItems.value = data['hydra:totalItems'] || data['totalItems'] || movies.value.length

    await nextTick()
    animateCards()
  } catch (err) {
    console.error("Erreur lors du chargement des données :", err);
  } finally {
    loading.value = false
  }
}

const animateCards = () => {
  if (document.querySelectorAll('.movie-card-wrapper').length > 0) {
    gsap.from('.movie-card-wrapper', {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    })
  }
}

const goToMovie = (id) => router.push(`/movies/${id}`)

// Watchers
watch(search, () => {
  page.value = 1;
  fetchMovies();
});

watch(page, () => {
  fetchMovies();
});

watch(() => route.query.category, () => {
  page.value = 1;
  fetchMovies();
});

onMounted(async () => {
  await fetchMovies()

  // Animations initiales
  gsap.from('.page-title', {
    opacity: 0,
    y: -50,
    duration: 0.8,
    ease: 'power3.out'
  })

  gsap.from('.search-bar', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.2,
    ease: 'power3.out'
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0f]">
    <div class="max-w-7xl mx-auto px-6 py-20 space-y-12">


      <div class="flex justify-between items-end">
        <div class="page-title">
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">COLLECTION</div>
          <h1 class="garamond text-6xl md:text-7xl font-bold text-white mb-3">
            {{ categoryName ? `Films - ${categoryName}` : 'Films' }}
          </h1>
          <div class="h-1 w-24 bg-gradient-to-r from-[#FFD700] to-transparent" />
        </div>
      </div>

      <div class="search-bar">
        <div class="relative">
          <label for="movie-search" class="sr-only">Rechercher un film</label>
          <input
              id="movie-search"
              v-model="search"
              placeholder="Rechercher un film..."
              class="w-full px-6 py-4 bg-[#16181E] text-white border border-[#2A2D36] rounded-lg focus:outline-none focus:border-[#FFD700] transition-all text-lg"
          />
          <svg class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center min-h-[40vh]" aria-label="Chargement en cours">
        <div class="flex gap-2">
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <!-- Grille de films -->
      <div v-else-if="movies.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="movie in movies" :key="movie.id" class="movie-card-wrapper group"
             @mouseenter="gsap.to($event.currentTarget, { scale: 1.03, duration: 0.3, ease: 'power2.out' })"
             @mouseleave="gsap.to($event.currentTarget, { scale: 1,  duration: 0.3, ease: 'power2.out' })">
          <div @click="goToMovie(movie.id)">
            <MovieCard :movie="movie" />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <div class="inline-block p-6 bg-[#16181E] rounded-full mb-6">
          <svg class="w-12 h-12 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
          </svg>
        </div>
        <p class="text-[#C1C1C7] text-lg">Aucun film trouvé</p>
        <button v-if="categoryName" @click="router.push('/movies')" class="mt-4 text-[#FFD700] hover:underline">Voir tous les films</button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-6 pt-8">
        <button
            :disabled="page === 1"
            @click="page--"
            class="w-12 h-12 rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center"
            aria-label="Page précédente"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <span class="text-[#C1C1C7] tracking-[0.2em] text-sm">
          PAGE <span class="text-[#FFD700] font-bold">{{ page }}</span> / {{ totalPages }}
        </span>

        <button
            :disabled="page === totalPages"
            @click="page++"
            class="w-12 h-12 rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center"
            aria-label="Page suivante"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
