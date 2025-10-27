<script setup>
import { ref, onMounted } from 'vue'
import api from '/src/api/api.js'
import MovieCard from '/src/components/MovieCard.vue'
import ActorCard from '/src/components/ActorCard.vue'
import { useRouter } from 'vue-router'

const movies = ref([])
const actors = ref([])
const router = useRouter()

const goToMovie = (id) => router.push(`/movies/${id}`)
const goToActor = (id) => router.push(`/actors/${id}`)

onMounted(async () => {
  try {
    const movieRes = await api.get('/movies', {
      params: { 'order[id]': 'desc', 'limit': 4, 'page': 1 }
    })


    const dataMovies = movieRes.data.member || []
    movies.value = dataMovies.sort((a, b) => b.id - a.id).slice(0, 4)



    const actorRes = await api.get('/actors', { params: { 'limit': 10000 } })
    const dataActors = actorRes.data.member || []
    actors.value = dataActors.sort((a, b) => b.id - a.id).slice(0, 4)


  } catch (error) {
    console.error('❌ Erreur lors du chargement des données :', error)
  }
})
</script>

<template>
  <div class="p-6 space-y-12">
    <section>
      <h2 class="text-3xl font-bold mb-6"> Derniers Films</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MovieCard
            v-for="movie in movies"
            :key="movie.id"
            :movie="movie"
            @click="goToMovie(movie.id)"
        />
      </div>
      <p v-if="movies.length === 0" class="text-center text-gray-500">Aucun film à afficher</p>
    </section>

    <section>
      <h2 class="text-3xl font-bold mb-6"> Derniers Acteurs</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ActorCard
            v-for="actor in actors"
            :key="actor.id"
            :actor="actor"
            @click="goToActor(actor.id)"
        />
      </div>
      <p v-if="actors.length === 0" class="text-center text-gray-500">Aucun acteur à afficher</p>
    </section>
  </div>
</template>

<style scoped>
h2 { color: #222; }
</style>
