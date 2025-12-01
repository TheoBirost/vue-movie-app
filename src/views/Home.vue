<script setup>
import { ref, onMounted } from 'vue'
import api from '/src/api/api.js'
import MovieCard from '/src/components/MovieCard.vue'
import ActorCard from '/src/components/ActorCard.vue'
import { useRouter } from 'vue-router'

const movies = ref([])
const actors = ref([])
const router = useRouter()
const errorMessage = ref("")
const loading = ref(false)

const goToMovie = (id) => router.push(`/movies/${id}`)
const goToActor = (id) => router.push(`/actors/${id}`)

onMounted(async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const movieRes = await api.get('/movies', {
      params: { 'order[release_date]': 'desc', 'limit': 4, 'page': 1 },
    })
    let fetchedMovies = movieRes.data.member || []

    for (const movie of fetchedMovies) {
      if (Array.isArray(movie.categories) && movie.categories.every(cat => typeof cat === 'string')) {
        const categoryPromises = movie.categories.map(async (iri) => {
          const categoryId = iri.match(/\/(\d+)$/)?.[1]
          if (!categoryId) return null
          try {
            const categoryRes = await api.get(`/categories/${categoryId}`)
            return categoryRes.data
          } catch {
            return null
          }
        })
        movie.categories = (await Promise.all(categoryPromises)).filter(cat => cat !== null)
      }
    }

    movies.value = fetchedMovies.sort((a, b) => b.id - a.id).slice(0, 4)

    const actorRes = await api.get('/actors', {
      params: { limit: 10000 },
    })
    const dataActors = actorRes.data.member || []
    actors.value = dataActors.sort((a, b) => b.id - a.id).slice(0, 4)

  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status} : ${err.response.data.message || "Non spécifié"}`
    } else if (err.request) {
      errorMessage.value = "Erreur réseau : aucune réponse du serveur"
    } else {
      errorMessage.value = err.message
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-color-bg text-color-text">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

      <header class="text-center mb-24" data-aos="fade-up">
        <h1 class="text-6xl font-gloock font-bold text-color-heading mb-4">World View</h1>
        <p class="text-lg text-color-text">Explore the world of cinema with elegance and style.</p>
      </header>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="w-16 h-16 border-4 border-color-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-if="errorMessage" class="text-center py-16 text-red-500" data-aos="fade-up">
        <p>{{ errorMessage }}</p>
      </div>

      <template v-if="!loading && !errorMessage">
        <section class="mb-24" data-aos="fade-up">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-4xl font-gloock font-bold text-color-heading">Latest Movies</h2>
            <router-link to="/movies" class="btn-secondary">
              View All &rarr;
            </router-link>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <MovieCard
              v-for="movie in movies"
              :key="movie.id"
              :movie="movie"
              @click="goToMovie(movie.id)"
              data-aos="fade-up"
            />
          </div>
        </section>

        <section data-aos="fade-up">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-4xl font-gloock font-bold text-color-heading">Featured Actors</h2>
            <router-link to="/actors" class="btn-secondary">
              View All &rarr;
            </router-link>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ActorCard
              v-for="actor in actors"
              :key="actor.id"
              :actor="actor"
              @click="goToActor(actor.id)"
              data-aos="fade-up"
            />
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
