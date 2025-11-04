<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '/src/api/api.js'

const emit = defineEmits(['close', 'refresh'])
const props = defineProps({ actor: Object })

const firstname = ref('')
const lastname = ref('')
const selectedMovies = ref([])
const allMovies = ref([])
const loading = ref(false)
const errors = ref(null)

const initFromActor = (a) => {
  if (!a) {
    firstname.value = ''
    lastname.value = ''
    selectedMovies.value = []
    return
  }
  firstname.value = a.firstname || ''
  lastname.value = a.lastname || ''
  selectedMovies.value = (a.movies || []).map(m => {
    if (typeof m === 'string') {
      const match = m.match(/\/(\d+)$/)
      return match ? Number(match[1]) : null
    }
    if (m.id) return m.id
    if (m['@id']) {
      const match = m['@id'].match(/\/(\d+)$/)
      return match ? Number(match[1]) : null
    }
    return null
  }).filter(id => id !== null)
}

const fetchMovies = async () => {
  try {
    const res = await api.get('/movies')
    allMovies.value = res.data.member || res.data['hydra:member'] || []
  } catch (err) {
    console.error('Erreur chargement films :', err)
  }
}

const toggleMovie = (id) => {
  if (selectedMovies.value.includes(id)) {
    selectedMovies.value = selectedMovies.value.filter(m => m !== id)
  } else {
    selectedMovies.value.push(id)
  }
}

onMounted(async () => {
  await fetchMovies()
  initFromActor(props.actor)
})
watch(() => props.actor, (a) => initFromActor(a))

const saveActor = async () => {
  loading.value = true
  errors.value = null

  try {


    if (props.actor?.id) {
      await api.patch(`/actors/${props.actor.id}`, {
        firstname: firstname.value,
        lastname: lastname.value
      }, { headers: { 'Content-Type': 'application/merge-patch+json' } })

      const currentActorRes = await api.get(`/actors/${props.actor.id}`)
      const currentMovieIds = (currentActorRes.data.movies || []).map(m => {
        if (typeof m === 'string') {
          const match = m.match(/\/(\d+)$/)
          return match ? Number(match[1]) : null
        }
        return m.id || null
      }).filter(id => id !== null)

      const toAdd = selectedMovies.value.filter(id => !currentMovieIds.includes(id))
      const toRemove = currentMovieIds.filter(id => !selectedMovies.value.includes(id))

      for (const movieId of toRemove) {
        const movieRes = await api.get(`/movies/${movieId}`)
        const movieActors = (movieRes.data.actors || [])
            .map(a => typeof a === 'string' ? a : `/api/actors/${a.id}`)
            .filter(iri => !iri.includes(`/${props.actor.id}`))

        await api.patch(`/movies/${movieId}`, { actors: movieActors }, {
          headers: { 'Content-Type': 'application/merge-patch+json' }
        })
      }

      for (const movieId of toAdd) {
        const movieRes = await api.get(`/movies/${movieId}`)
        const movieActors = (movieRes.data.actors || [])
            .map(a => typeof a === 'string' ? a : `/api/actors/${a.id}`)

        if (!movieActors.includes(`/api/actors/${props.actor.id}`)) {
          movieActors.push(`/api/actors/${props.actor.id}`)
        }

        await api.patch(`/movies/${movieId}`, { actors: movieActors }, {
          headers: { 'Content-Type': 'application/merge-patch+json' }
        })
      }

    } else {
      const response = await api.post('/actors', {
        firstname: firstname.value,
        lastname: lastname.value
      }, { headers: { 'Content-Type': 'application/ld+json' } })

      const newActorId = response.data.id
      for (const movieId of selectedMovies.value) {
        const movieRes = await api.get(`/movies/${movieId}`)
        const movieActors = (movieRes.data.actors || [])
            .map(a => typeof a === 'string' ? a : `/api/actors/${a.id}`)

        movieActors.push(`/api/actors/${newActorId}`)

        await api.patch(`/movies/${movieId}`, { actors: movieActors }, {
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
    <div
        class="bg-white/90 backdrop-blur-xl rounded-2xl w-full max-w-lg p-8 shadow-2xl border border-gray-200/50 transition-all duration-200 animate-fadeIn"
    >
      <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
        {{ props.actor ? 'Modifier un acteur' : 'Ajouter un acteur' }}
      </h2>

      <div class="space-y-5">
        <input
            v-model="firstname"
            placeholder="Prénom"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />

        <input
            v-model="lastname"
            placeholder="Nom"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Films</label>

          <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
            <div
                v-for="movie in allMovies"
                :key="movie.id"
                class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                @click="toggleMovie(movie.id)"
            >
              <div class="flex items-center gap-3">
                <div
                    class="w-5 h-5 flex items-center justify-center border rounded-md transition-all"
                    :class="selectedMovies.includes(movie.id)
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-gray-300'"
                >
                  <svg
                      v-if="selectedMovies.includes(movie.id)"
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="3"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-gray-800 font-medium">{{ movie.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="errors" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
          {{ errors }}
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-8">
        <button
            @click="emit('close')"
            class="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all active:scale-95 font-medium"
        >
          Annuler
        </button>
        <button
            @click="saveActor"
            :disabled="loading"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 font-medium disabled:opacity-60"
        >
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>