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

    movies.value = res.data.member || []
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
  <div class="min-h-screen bg-[var(--bg-main)]">
    <div class="max-w-7xl mx-auto px-6 py-16 space-y-12">

      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-5xl font-bold text-white mb-2">Films</h1>
          <p class="text-[var(--text-gray)]">Découvrez notre collection</p>
        </div>

        <button
            v-if="userRole === 'ROLE_ADMIN'"
            @click="selectedMovie = null; showForm = true"
            class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black font-semibold rounded-lg transition"
        >
          + Ajouter
        </button>
      </div>

      <input
          v-model="search"
          placeholder="Rechercher un film..."
          class="w-full px-4 py-3 bg-[var(--bg-card)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition"
      />

      <div v-if="loading" class="text-center py-20">
        <div class="flex gap-2 justify-center">
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <div v-else-if="movies.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="movie in movies" :key="movie.id">
          <div @click="goToMovie(movie.id)">
            <MovieCard :movie="movie" />
          </div>

          <div v-if="userRole === 'ROLE_ADMIN'" class="flex gap-2 mt-3">
            <button
                @click.stop="editMovie(movie)"
                class="flex-1 px-3 py-2 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-gray)] text-sm rounded-lg transition"
            >
              Modifier
            </button>
            <button
                @click.stop="confirmDelete(movie)"
                class="flex-1 px-3 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 text-sm rounded-lg transition"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-[var(--text-gray)] text-lg">{{ errorMessage || "Aucun film trouvé" }}</p>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4">
        <button
            :disabled="page === 1"
            @click="page--"
            class="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--gold)] disabled:opacity-30 transition text-white"
        >
          ◀
        </button>

        <span class="text-[var(--text-gray)]">
          Page {{ page }} / {{ totalPages }}
        </span>

        <button
            :disabled="page === totalPages"
            @click="page++"
            class="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--gold)] disabled:opacity-30 transition text-white"
        >
          ▶
        </button>
      </div>
    </div>

    <MovieForm
        v-if="showForm"
        :movie="selectedMovie"
        @close="showForm = false"
        @refresh="fetchMovies"
    />

    <ConfirmDelete
        v-if="showConfirm"
        :movie="movieToDelete"
        @cancel="showConfirm = false"
        @confirm="deleteMovie"
    />
  </div>
</template>