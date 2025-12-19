<script setup>
import { ref, onMounted, computed } from "vue"
import { useDataStore } from '../../../stores/useDataStore'
import MovieForm from "../forms/MovieForm.vue"
import ConfirmDelete from "../modals/ConfirmDeleteMovie.vue"
import api from '../../../api/api'

const dataStore = useDataStore()

const loading = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const selectedMovie = ref(null)
const movieToDelete = ref(null)

const movies = computed(() => dataStore.movies)

const fetchData = async (force = false) => {
  loading.value = true
  try {
    await dataStore.fetchMovies(force)
  } catch (err) {
    console.error("Erreur lors du chargement des données :", err);
  } finally {
    loading.value = false
  }
}

const editMovie = (movie) => {
  selectedMovie.value = { ...movie }
  showForm.value = true
}

const confirmDelete = (movie) => {
  movieToDelete.value = movie
  showConfirm.value = true
}

const deleteMovie = async () => {
  if (!movieToDelete.value) return;
  try {
    await api.delete(`/movies/${movieToDelete.value.id}`)
    dataStore.removeMovieById(movieToDelete.value.id);
    showConfirm.value = false
    movieToDelete.value = null
  } catch (err) {
    console.error("Erreur suppression :", err)
  }
}

const onFormSaved = async () => {
  showForm.value = false;
  await fetchData(true);
};

onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <div class="universal-card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="garamond text-3xl font-bold text-white">Manage Movies</h2>
      <button
        @click="selectedMovie = null; showForm = true"
        class="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-widest uppercase"
      >
        + Add Movie
      </button>
    </div>
    <div v-if="loading" class="text-center py-10">
      <p class="text-text-gray">Loading movies...</p>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="border-b border-border">
          <tr>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider">Name</th>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movie in movies" :key="movie.id" class="border-b border-border hover:bg-bg-hover">
            <td class="p-4 text-text-white">{{ movie.name }}</td>
            <td class="p-4 text-right">
              <button @click="editMovie(movie)" class="text-gold hover:text-gold-light font-semibold transition-colors mr-4">Edit</button>
              <button @click="confirmDelete(movie)" class="text-red-500 hover:text-red-400 font-semibold transition-colors">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <MovieForm
      v-if="showForm"
      :movie="selectedMovie"
      @close="showForm = false"
      @refresh="onFormSaved"
    />
    <ConfirmDelete
      v-if="showConfirm"
      :movie="movieToDelete"
      @cancel="showConfirm = false"
      @confirm="deleteMovie"
    />
  </div>
</template>
