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
    const dataMovies = movieRes.data.member || []
    movies.value = dataMovies.sort((a, b) => b.id - a.id).slice(0, 4)

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
  <div class="p-6 space-y-12">
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-400 text-lg animate-pulse">Chargement...</p>
    </div>

    <template v-else>
      <section>
        <h2 class="text-3xl font-bold mb-6">Derniers Films</h2>

        <div v-if="errorMessage" class="text-center text-gray-400 text-lg py-6">
          {{ errorMessage || "Aucun film trouvé" }}
        </div>
        <div v-else>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MovieCard
                v-for="movie in movies"
                :key="movie.id"
                :movie="movie"
                @click="goToMovie(movie.id)"
            />
          </div>
          <p v-if="movies.length === 0" class="text-center text-gray-400 mt-4">
            Aucun film à afficher
          </p>
        </div>
      </section>

      <section>
        <h2 class="text-3xl font-bold mb-6">Derniers Acteurs</h2>

        <div v-if="errorMessage" class="text-center text-gray-400 text-lg py-6">
          {{ errorMessage || "Aucun acteur trouvé" }}
        </div>
        <div v-if="errorMessage" class="text-center py-20">
          <router-link
              to="/"
              class="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 items-center gap-1"
          >
            <span>Se reconnecter</span>
          </router-link>
        </div>

        <div v-else>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ActorCard
                v-for="actor in actors"
                :key="actor.id"
                :actor="actor"
                @click="goToActor(actor.id)"
            />
          </div>
          <p v-if="actors.length === 0" class="text-center text-gray-400 mt-4">
            Aucun acteur à afficher
          </p>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
</style>