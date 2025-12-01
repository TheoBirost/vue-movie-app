<script setup>
import { ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import api from "/src/api/api.js"
import MovieForm from "/src/components/MovieForm.vue"
import ConfirmDelete from "/src/components/ConfirmDeleteMovie.vue"
import MovieCard from "/src/components/MovieCard.vue"

const router = useRouter()

const movies = ref([])
const search = ref("")
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const errorMessage = ref("")
const showForm = ref(false)
const showConfirm = ref(false)
const selectedMovie = ref(null)
const movieToDelete = ref(null)
const userRole = ref('')

const limit = 12

const fetchMovies = async () => {
  loading.value = true
  errorMessage.value = ""
  try {
    const res = await api.get("/movies", {
      params: {
        page: page.value,
        itemsPerPage: limit,
        "order[id]": "desc",
        name: search.value || undefined,
      },
    })

    let fetchedMovies = res.data.member || []

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

    movies.value = fetchedMovies
    const totalItems = res.data.totalItems || 0
    totalPages.value = Math.max(1, Math.ceil(totalItems / limit))
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status}`
    } else if (err.request) {
      errorMessage.value = "Aucun film trouvé"
    } else {
      errorMessage.value = err.message
    }
  } finally {
    loading.value = false
  }
}

const goToMovie = (id) => router.push(`/movies/${id}`)

const editMovie = (movie) => {
  selectedMovie.value = { ...movie }
  showForm.value = true
}

const confirmDelete = (movie) => {
  movieToDelete.value = movie
  showConfirm.value = true
}

const deleteMovie = async () => {
  try {
    await api.delete(`/movies/${movieToDelete.value.id}`)
    showConfirm.value = false
    movieToDelete.value = null
    await fetchMovies()
  } catch (err) {
    console.error("Erreur suppression :", err)
  }
}

watch(page, fetchMovies)

let searchTimeout = null
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchMovies()
  }, 300)
})

onMounted(async () => {
  await fetchMovies()
  try {
    const res = await api.get(import.meta.env.VITE_API_URL_USER)
    userRole.value = res.data.roles[0] || 'aucun rôle'
  } catch (err) {
    console.error("Erreur récupération rôle :", err)
  }
})
</script>

<template>
  <div class="min-h-screen bg-color-bg text-color-text">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header class="flex flex-col md:flex-row justify-between items-center mb-12" data-aos="fade-down">
        <div class="text-center md:text-left mb-8 md:mb-0">
          <h1 class="text-5xl font-gloock font-bold text-color-heading mb-2">All Movies</h1>
          <p class="text-lg text-color-text">Discover our curated collection of films.</p>
        </div>
        <button
          v-if="userRole === 'ROLE_ADMIN'"
          @click="selectedMovie = null; showForm = true"
          class="btn-primary"
        >
          + Add Movie
        </button>
      </header>

      <div class="mb-12" data-aos="fade-down">
        <input
          v-model="search"
          type="text"
          placeholder="Search for a movie..."
          class="w-full px-5 py-3 bg-color-surface border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary transition-all"
        />
      </div>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="w-16 h-16 border-4 border-color-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-if="errorMessage" class="text-center py-16 text-red-500" data-aos="fade-up">
        <p>{{ errorMessage }}</p>
      </div>

      <div v-else-if="movies.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div v-for="movie in movies" :key="movie.id" data-aos="fade-up">
            <MovieCard :movie="movie" @click="goToMovie(movie.id)" />
            <div v-if="userRole === 'ROLE_ADMIN'" class="flex gap-2 mt-4">
              <button @click.stop="editMovie(movie)" class="w-full py-2 px-4 btn-secondary">Edit</button>
              <button @click.stop="confirmDelete(movie)" class="w-full py-2 px-4 btn-danger">Delete</button>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="flex justify-center items-center space-x-4">
          <button @click="page--" :disabled="page === 1" class="btn-secondary">
            &larr; Previous
          </button>
          <span class="text-color-text">Page {{ page }} of {{ totalPages }}</span>
          <button @click="page++" :disabled="page === totalPages" class="btn-secondary">
            Next &rarr;
          </button>
        </div>
      </div>

      <div v-else class="text-center py-20" data-aos="fade-up">
        <p class="text-color-text text-lg">No movies found. Try a different search.</p>
      </div>
    </div>

    <MovieForm v-if="showForm" :movie="selectedMovie" @close="showForm = false" @refresh="fetchMovies" />
    <ConfirmDelete v-if="showConfirm" :movie="movieToDelete" @cancel="showConfirm = false" @confirm="deleteMovie" />
  </div>
</template>
