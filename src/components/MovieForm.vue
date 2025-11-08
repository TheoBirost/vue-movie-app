<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '/src/api/api.js'

const emit = defineEmits(['close', 'refresh'])
const props = defineProps({ movie: Object })

const title = ref('')
const description = ref('')
const releaseDate = ref('')
const budget = ref('')
const duration = ref('')
const selectedActors = ref([])
const allActors = ref([])
const loading = ref(false)
const errors = ref(null)

const initFromMovie = (m) => {
  if (!m) {
    title.value = ''
    description.value = ''
    releaseDate.value = ''
    budget.value = ''
    duration.value = ''
    selectedActors.value = []
    return
  }
  title.value = m.name || ''
  description.value = m.description || ''
  releaseDate.value = m.releaseDate || ''
  budget.value = m.budget || ''
  duration.value = m.duration || ''
  selectedActors.value = (m.actors || []).map(a => {
    if (typeof a === 'string') {
      const match = a.match(/\/(\d+)$/)
      return match ? Number(match[1]) : null
    }
    if (a.id) return a.id
    if (a['@id']) {
      const match = a['@id'].match(/\/(\d+)$/)
      return match ? Number(match[1]) : null
    }
    return null
  }).filter(id => id !== null)
}

const fetchActors = async () => {
  try {
    const res = await api.get('/actors')
    allActors.value = res.data.member || res.data['hydra:member'] || []
  } catch (err) {
    console.error('Erreur chargement acteurs :', err)
  }
}

const toggleActor = (id) => {
  if (selectedActors.value.includes(id)) {
    selectedActors.value = selectedActors.value.filter(a => a !== id)
  } else {
    selectedActors.value.push(id)
  }
}

onMounted(async () => {
  await fetchActors()
  initFromMovie(props.movie)
})
watch(() => props.movie, (m) => initFromMovie(m))

const saveMovie = async () => {
  loading.value = true
  errors.value = null

  try {
    const movieData = {
      name: title.value,
      description: description.value,
      releaseDate: releaseDate.value,
      budget: budget.value,
      duration: duration.value
    }

    if (props.movie?.id) {
      await api.patch(`/movies/${props.movie.id}`, movieData, { headers: { 'Content-Type': 'application/merge-patch+json' } })

      const currentMovieRes = await api.get(`/movies/${props.movie.id}`)
      const currentActorIds = (currentMovieRes.data.actors || []).map(a => {
        if (typeof a === 'string') {
          const match = a.match(/\/(\d+)$/)
          return match ? Number(match[1]) : null
        }
        return a.id || null
      }).filter(id => id !== null)

      const toAdd = selectedActors.value.filter(id => !currentActorIds.includes(id))
      const toRemove = currentActorIds.filter(id => !selectedActors.value.includes(id))

      for (const actorId of toRemove) {
        const actorRes = await api.get(`/actors/${actorId}`)
        const actorMovies = (actorRes.data.movies || [])
            .map(m => typeof m === 'string' ? m : `/api/movies/${m.id}`)
            .filter(iri => !iri.includes(`/${props.movie.id}`))

        await api.patch(`/actors/${actorId}`, { movies: actorMovies }, {
          headers: { 'Content-Type': 'application/merge-patch+json' }
        })
      }

      for (const actorId of toAdd) {
        const actorRes = await api.get(`/actors/${actorId}`)
        const actorMovies = (actorRes.data.movies || [])
            .map(m => typeof m === 'string' ? m : `/api/movies/${m.id}`)

        if (!actorMovies.includes(`/api/movies/${props.movie.id}`)) {
          actorMovies.push(`/api/movies/${props.movie.id}`)
        }

        await api.patch(`/actors/${actorId}`, { movies: actorMovies }, {
          headers: { 'Content-Type': 'application/merge-patch+json' }
        })
      }

    } else {
      const response = await api.post('/movies', movieData, { headers: { 'Content-Type': 'application/ld+json' } })
      const newMovieId = response.data.id

      for (const actorId of selectedActors.value) {
        const actorRes = await api.get(`/actors/${actorId}`)
        const actorMovies = (actorRes.data.movies || [])
            .map(m => typeof m === 'string' ? m : `/api/movies/${m.id}`)
        actorMovies.push(`/api/movies/${newMovieId}`)

        await api.patch(`/actors/${actorId}`, { movies: actorMovies }, {
          headers: { 'Content-Type': 'application/merge-patch+json' }
        })
      }
    }

    emit('refresh')
    emit('close')
  } catch (err) {
    console.error('Erreur sauvegarde :', err.response || err)
    errors.value = err.response?.data?.['hydra:description'] || err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
    <div class="bg-white/90 backdrop-blur-xl rounded-2xl w-full max-w-lg p-8 shadow-2xl border border-gray-200/50 transition-all duration-200 animate-fadeIn">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
        {{ props.movie ? 'Modifier un film' : 'Ajouter un film' }}
      </h2>

      <div class="space-y-5">
        <input v-model="title" placeholder="Titre du film"
               class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />

        <textarea v-model="description" placeholder="Description"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl h-28 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"></textarea>

        <input v-model="releaseDate" type="date" placeholder="Date de sortie"
               class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />

        <input v-model="budget" type="number" placeholder="Budget en dollars"
               class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />

        <input v-model="duration" type="number" placeholder="Durée en minutes"
               class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Acteurs</label>
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
            <div v-for="actor in allActors" :key="actor.id"
                 class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                 @click="toggleActor(actor.id)">
              <div class="flex items-center gap-3">
                <div class="w-5 h-5 flex items-center justify-center border rounded-md transition-all"
                     :class="selectedActors.includes(actor.id)
                     ? 'bg-blue-600 border-blue-600'
                     : 'bg-white border-gray-300'">
                  <svg v-if="selectedActors.includes(actor.id)" xmlns="http://www.w3.org/2000/svg"
                       class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                       stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-gray-800 font-medium">{{ actor.firstname }} {{ actor.lastname }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="errors" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
          {{ errors }}
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-8">
        <button @click="emit('close')" class="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all active:scale-95 font-medium">
          Annuler
        </button>
        <button @click="saveMovie" :disabled="loading"
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 font-medium disabled:opacity-60">
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
