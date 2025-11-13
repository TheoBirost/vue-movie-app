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
  <div class="min-h-screen bg-[var(--bg-main)]">
    <div class="max-w-7xl mx-auto px-6 py-16 space-y-16">

      <div class="text-center space-y-4">
        <h1 class="text-7xl md:text-8xl font-bold text-[var(--gold)]">Movie's</h1>
        <p class="text-lg text-[var(--text-gray)]">Recherchez des films et acteurs que vous aimez</p>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="flex gap-2">
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <template v-else>
        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-3xl font-bold text-white">Derniers Films</h2>
            <router-link
                to="/movies"
                class="text-sm text-[var(--text-gray)] hover:text-[var(--gold)] transition-colors"
            >
              Voir tout →
            </router-link>
          </div>

          <div v-if="errorMessage" class="text-center text-[var(--text-gray)] py-12">
            {{ errorMessage }}
          </div>
          <div v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MovieCard
                  v-for="movie in movies"
                  :key="movie.id"
                  :movie="movie"
                  @click="goToMovie(movie.id)"
              />
            </div>
          </div>
        </section>

        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-3xl font-bold text-white">Derniers Acteurs</h2>
            <router-link
                to="/actors"
                class="text-sm text-[var(--text-gray)] hover:text-[var(--gold)] transition-colors"
            >
              Voir tout →
            </router-link>
          </div>

          <div v-if="errorMessage" class="text-center text-[var(--text-gray)] py-12">
            {{ errorMessage }}
          </div>
          <div v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ActorCard
                  v-for="actor in actors"
                  :key="actor.id"
                  :actor="actor"
                  @click="goToActor(actor.id)"
              />
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>