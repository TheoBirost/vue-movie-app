<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
        } catch (err) {
          console.error(`Erreur chargement film ${movieId}:`, err)
          return null
        }
      })

      const moviesLoaded = await Promise.all(moviePromises)
      movies.value = moviesLoaded.filter(m => m !== null)
    } else {
      movies.value = actorData.movies || []
    }

    actor.value = actorData
  } catch (err) {
    console.error("Erreur lors du chargement de l'acteur :", err)
    error.value = err.message
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString) => {
  if (!dateString) return "Toujours en vie";
  const date = new Date(dateString);
  if (isNaN(date)) return "-";

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[70vh]">
      <div class="text-gray-400 text-lg animate-pulse">Chargement...</div>
    </div>

    <section v-else-if="actor" class="max-w-6xl mx-auto px-6 py-12">
      <button
          @click="router.back()"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="transition-transform group-hover:-translate-x-1">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <span class="font-medium">Retour</span>
      </button>

      <div class="mb-16">
          <div class="max-w-52 min-w-52 min-h-28 max-h-28 relative overflow-hidden rounded-2xl bg-gray-100 mb-3">
            <img
                :src="actor.url ? actor.url : '/default-film.jpeg'"
                :alt="actor.name"
                class="w-full h-auto object-cover"
            />
        </div>

        <h1 class="text-6xl font-semibold mb-6 text-gray-900 tracking-tight leading-tight">
          {{ actor.firstname }} {{ actor.lastname }}
        </h1>
        <br>
        <p class="text-xl text-gray-600 leading-relaxed max-w-3xl">
          {{ actor.bio }}
        </p>
        <br>
        <p class="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Né(e) le {{ formatDate(actor.dob) }}  et  {{ actor.dod ? `Décédé(e) le ${formatDate(actor.dod)}` : " est toujours en vie" }}
        </p>

        <p v-if="actor.birthDate" class="text-lg text-gray-500 mb-6">
          Né(e) le {{ new Date(actor.birthDate).toLocaleDateString('fr-FR') }}
        </p>

        <p v-if="actor.biography" class="text-xl text-gray-600 leading-relaxed max-w-3xl">
          {{ actor.biography }}
        </p>
      </div>

      <div v-if="movies.length > 0">
        <h2 class="text-4xl font-semibold mb-10 text-gray-900">
          Nombre de films joués : {{ movies.length }}
        </h2>

        <div class="max-w-screen-lg mx-auto">
          <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              style="grid-auto-flow: row;"
          >
            <div
                v-for="movie in movies"
                :key="movie.id"
                @click="router.push(`/movies/${movie.id}`)"
                class="cursor-pointer col-span-1 w-full min-w-0"
            >
              <div class="w-full h-full">
                <MovieCard :movie="movie" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <p class="text-gray-400 text-lg">Aucun film pour cet acteur</p>
      </div>
    </section>

    <div v-else class="flex flex-col items-center justify-center min-h-[70vh]">
      <p class="text-gray-400 text-xl mb-6">
        {{ error ? `Erreur: ${error}` : 'Acteur introuvable' }}
      </p>
      <button
          @click="router.push('/actors')"
          class="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-6 py-3 rounded-xl transition-all duration-200 active:scale-95"
      >
        Retour aux acteurs
      </button>
    </div>
  </div>
</template>
