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
    const movieData = res.data

    if (movieData.releaseDate) {
      const date = new Date(movieData.releaseDate)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      movieData.releaseDate = `${day}-${month}-${year}`
    }

    if (Array.isArray(movieData.actors) && typeof movieData.actors[0] === 'string') {
      const actorPromises = movieData.actors.map(async (iri) => {
        const actorId = iri.match(/\/(\d+)$/)?.[1]
        if (!actorId) return null
        try {
          const actorRes = await api.get(`/actors/${actorId}`)
          return actorRes.data
        } catch (err) {
          console.error(`Erreur chargement acteur ${actorId}:`, err)
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
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[70vh]">
      <div class="text-gray-400 text-lg animate-pulse">Chargement...</div>
    </div>

    <section v-else-if="movie" class="max-w-6xl mx-auto px-6 py-12">
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
        <h1 class="text-6xl font-semibold mb-6 text-gray-900 tracking-tight leading-tight">
          {{ movie.name }}
        </h1>

        <div class="max-w-52 min-w-52 min-h-28 max-h-28 relative overflow-hidden rounded-2xl bg-gray-100 mb-3">
          <img
              :src="movie.url ? movie.url : 'http://localhost:8319/public/medie/images/default-film-690e4f5a324eb814818442.jpg'"
              :alt="movie.name"
              class="w-full h-auto object-cover"
          />
        </div>

        <p class="text-lg text-gray-600 mb-6">
          Date de sortie : {{ movie.releaseDate }}
        </p>

        <p class="text-xl text-gray-600 leading-relaxed max-w-3xl">
          {{ movie.description }}
        </p>
        <br>
        <p class="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Le budget total du film est de {{movie.budget}} dollars ($)
        </p>
        <br>
        <p class="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Le film dure {{movie.duration}} minutes
        </p>
      </div>

      <div v-if="movie.actors && movie.actors.length > 0">
        <h2 class="text-4xl font-semibold mb-10 text-gray-900">Acteur(s) dans ce film</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div
              v-for="actor in movie.actors"
              :key="actor.id"
              @click="router.push(`/actors/${actor.id}`)"
              class="cursor-pointer"
          >
            <ActorCard :actor="actor" />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <p class="text-gray-400 text-lg">Aucun acteur pour ce film</p>
      </div>
    </section>

    <div v-else class="flex flex-col items-center justify-center min-h-[70vh]">
      <p class="text-gray-400 text-xl mb-6">Film introuvable</p>
      <button
          @click="router.push('/movies')"
          class="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-6 py-3 rounded-xl transition-all duration-200 active:scale-95"
      >
        Retour aux films
      </button>
    </div>
  </div>
</template>