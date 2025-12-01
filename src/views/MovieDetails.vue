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
    let movieData = res.data

    if (movieData.releaseDate) {
      const date = new Date(movieData.releaseDate)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      movieData.releaseDate = `${day}-${month}-${year}`
    }

    // Hydrater les catégories si elles sont des IRIs
    if (Array.isArray(movieData.categories) && movieData.categories.every(cat => typeof cat === 'string')) {
      const categoryPromises = movieData.categories.map(async (iri) => {
        const categoryId = iri.match(/\/(\d+)$/)?.[1]
        if (!categoryId) return null
        try {
          const categoryRes = await api.get(`/categories/${categoryId}`)
          return categoryRes.data
        } catch {
          return null
        }
      })
      movieData.categories = (await Promise.all(categoryPromises)).filter(cat => cat !== null)
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
  <div class="min-h-screen bg-color-bg text-color-text">
    <div v-if="loading" class="flex justify-center items-center h-screen">
      <div class="w-16 h-16 border-4 border-color-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="movie" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <button @click="router.back()" class="mb-8 inline-flex items-center gap-2 btn-secondary" data-aos="fade-right">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Back
      </button>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div class="md:col-span-1" data-aos="zoom-in">
          <img :src="movie.url || '/default-film.jpg'" :alt="movie.name" class="w-full h-auto rounded-lg shadow-2xl object-cover">
        </div>

        <div class="md:col-span-2 space-y-6" data-aos="fade-left">
          <h1 class="text-5xl font-gloock font-bold text-color-heading">{{ movie.name }}</h1>
          <div class="flex items-center space-x-4 text-color-text">
            <span>Release Date: {{ movie.releaseDate }}</span>
            <span>&bull;</span>
            <span>Duration: {{ movie.duration }} min</span>
            <span>&bull;</span>
            <span>Budget: ${{ movie.budget }}</span>
          </div>
          <p class="text-lg leading-relaxed">{{ movie.description }}</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="category in movie.categories" :key="category.id" class="px-3 py-1 text-sm font-medium bg-color-bg text-color-text rounded-full border border-color-border">
              {{ category.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="movie.actors && movie.actors.length > 0" class="mt-24" data-aos="fade-up">
        <h2 class="text-4xl font-gloock font-bold text-color-heading mb-8">Cast</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <ActorCard
            v-for="actor in movie.actors"
            :key="actor.id"
            :actor="actor"
            @click="router.push(`/actors/${actor.id}`)"
            data-aos="fade-up"
          />
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center h-screen text-center" data-aos="fade-up">
      <h2 class="text-3xl font-bold text-color-heading mb-4">Movie Not Found</h2>
      <p class="text-color-text mb-8">We couldn't find the movie you're looking for.</p>
      <router-link to="/movies" class="btn-primary">
        Back to Movies
      </router-link>
    </div>
  </div>
</template>
