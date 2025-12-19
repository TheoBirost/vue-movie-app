<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import api from '/src/api/api.js'
import ActorCard from '../../components/domain/ActorCard.vue'
import ReviewList from '../../components/features/reviews/ReviewList.vue'
import ReviewForm from '../../components/features/reviews/ReviewForm.vue'

const route = useRoute()
const router = useRouter()
const movie = ref(null)
const categories = ref([])
const reviews = ref([])
const loading = ref(true)
const loadingCategories = ref(true)
const loadingReviews = ref(true)

const categoryShortNames = {
  'Documentaire': 'Docu',
  'Science Fiction': 'SF',
  'Science-Fiction': 'SF'
}

const getShortCategoryName = (categoryName) => {
  return categoryShortNames[categoryName] || categoryName
}

const loadActorData = async (actorIriOrObject) => {
  if (typeof actorIriOrObject === 'object') return actorIriOrObject

  const id = actorIriOrObject.split('/').pop()
  try {
    const res = await api.get(`/actors/${id}`)
    return res.data
  } catch (e) {
    console.error("Erreur chargement acteur", id, e)
    return null
  }
}

const fetchCategories = async (categoryUrls) => {
  if (!categoryUrls || categoryUrls.length === 0) {
    loadingCategories.value = false
    return
  }

  try {
    const categoryPromises = categoryUrls.map(async (categoryUrl) => {
      const path = categoryUrl.replace('/api', '')
      const response = await api.get(path)
      return response.data
    })

    categories.value = await Promise.all(categoryPromises)
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

const fetchReviews = async () => {
  loadingReviews.value = true
  try {
    const response = await api.get(`/movies/${route.params.id}/reviews`)
    reviews.value = response.data['hydra:member']
  } catch (error) {
    console.error('Erreur lors du chargement des avis:', error)
  } finally {
    loadingReviews.value = false
  }
}

onMounted(async () => {
  try {
    const res = await api.get(`/movies/${route.params.id}`, {
      params: {
        'groups[]': ['movie:read', 'movie:detail'],
      }
    })
    const movieData = res.data

    if (movieData.releaseDate) {
      const date = new Date(movieData.releaseDate)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      movieData.releaseDate = `${day}-${month}-${year}`
    }

    if (movieData.actors && movieData.actors.length > 0) {
      const actorsPromises = movieData.actors.map(loadActorData)
      const loadedActors = await Promise.all(actorsPromises)
      movieData.actors = loadedActors.filter(a => a !== null)
    }

    if (movieData.categories && movieData.categories.length > 0) {
      await fetchCategories(movieData.categories)
    } else {
      loadingCategories.value = false
    }

    movie.value = movieData
    await fetchReviews()

    await nextTick()

    if (document.querySelector('.movie-poster')) {
      gsap.from('.movie-poster', {
        opacity: 0,
        x: -50,
        duration: 0.8,
        ease: 'power3.out'
      })
    }

    if (document.querySelector('.movie-info')) {
      gsap.from('.movie-info', {
        opacity: 0,
        x: 50,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out'
      })
    }

    if (document.querySelectorAll('.actor-grid-item').length > 0) {
      gsap.from('.actor-grid-item', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.4,
        ease: 'power3.out'
      })
    }
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
    <div v-else-if="movie" class="max-w-7xl mx-auto px-6 py-12 space-y-12">
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
      <div class="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

        <!-- Poster (Taille réduite et fixe) -->
        <div class="movie-poster w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div class="relative overflow-hidden rounded-lg border border-[#2A2D36] shadow-2xl group max-w-[300px] mx-auto md:max-w-none">
            <img
                :src="movie.url || '/default-film.jpg'"
                :alt="movie.name"
                class="w-full h-auto object-cover aspect-[2/3]"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
          </div>
        </div>

        <!-- Informations -->
        <div class="movie-info flex-1 space-y-6">
          <div>
            <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">FILM</div>
            <h1 class="garamond text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              {{ movie.name }}
            </h1>
            <div class="h-1 w-24 bg-gradient-to-r from-[#FFD700] to-transparent mb-6" />
          </div>

          <!-- Stats -->
          <div class="flex flex-wrap gap-3">
            <div class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-[#82828A] text-[10px] uppercase tracking-wider block mb-1">Sortie</span>
              <p class="text-white font-semibold text-sm">{{ movie.releaseDate }}</p>
            </div>
            <div class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-[#82828A] text-[10px] uppercase tracking-wider block mb-1">Durée</span>
              <p class="text-white font-semibold text-sm">{{ movie.duration }} min</p>
            </div>
            <div class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded-lg">
              <span class="text-[#82828A] text-[10px] uppercase tracking-wider block mb-1">Budget</span>
              <p class="text-white font-semibold text-sm">{{ movie.budget?.toLocaleString() }} $</p>
            </div>
          </div>

          <!-- Synopsis -->
          <div class="space-y-2">
            <h3 class="text-[#FFD700] text-xs tracking-[0.2em] uppercase font-bold">Synopsis</h3>
            <p class="text-[#C1C1C7] leading-relaxed text-base">
              {{ movie.description }}
            </p>
          </div>

          <!-- Genres/Catégories -->
          <div class="space-y-2">
            <h3 class="text-[#FFD700] text-xs tracking-[0.2em] uppercase font-bold">Genres</h3>
            <div class="flex flex-wrap gap-2">
              <template v-if="loadingCategories">
                <span class="px-3 py-1.5 text-xs bg-[#16181E] border border-[#2A2D36] rounded text-[#82828A] animate-pulse">
                  ...
                </span>
              </template>
              <template v-else-if="categories.length > 0">
                <span
                    v-for="category in categories"
                    :key="category.id"
                    class="px-3 py-1.5 text-xs bg-[#16181E] border border-[#2A2D36] rounded text-white hover:border-[#FFD700] hover:text-[#FFD700] transition-colors text-sm"
                >
                  {{ getShortCategoryName(category.name) }}
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribution -->
      <div v-if="movie.actors && movie.actors.length > 0" class="space-y-6 pt-8 border-t border-[#2A2D36]">
        <div>
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">DISTRIBUTION</div>
          <h2 class="garamond text-3xl md:text-4xl font-bold text-white">Acteurs</h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
              v-for="actor in movie.actors"
              :key="actor.id"
              @click="router.push(`/actors/${actor.id}`)"
              class="actor-grid-item cursor-pointer"
          >
            <ActorCard :actor="actor" />
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <div class="space-y-6 pt-8 border-t border-[#2A2D36]">
        <ReviewList :reviews="reviews" v-if="!loadingReviews" />
        <div v-else class="text-center">Loading reviews...</div>
        <ReviewForm :movie-id="movie.id" @review-submitted="fetchReviews" />
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
