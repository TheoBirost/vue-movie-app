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
  <div class="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 px-4 animate-fadeIn">
    <div class="bg-[var(--color-gigas-900)]/95 backdrop-blur-2xl rounded-3xl w-full max-w-2xl p-8 shadow-2xl border border-[var(--color-gigas-700)]/50 transition-all duration-300 animate-slideUp max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-bold text-[var(--color-gigas-300)]">
          {{ props.movie ? 'Modifier le film' : 'Nouveau film' }}
        </h2>
        <button @click="emit('close')" class="p-2 hover:bg-[var(--color-gigas-800)]/60 rounded-xl transition-all text-[var(--color-gigas-300)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-2">Titre du film</label>
          <input v-model="title" placeholder="Ex: Inception"
                 class="w-full px-5 py-3.5 bg-[var(--color-gigas-800)]/60 backdrop-blur-sm text-white border border-[var(--color-gigas-700)]/50 rounded-xl focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:outline-none focus:border-[var(--color-gigas-500)] transition-all placeholder-[var(--color-gigas-500)]" />
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-2">Description</label>
          <textarea v-model="description" placeholder="Décrivez l'intrigue du film..."
                    class="w-full px-5 py-3.5 bg-[var(--color-gigas-800)]/60 backdrop-blur-sm text-white border border-[var(--color-gigas-700)]/50 rounded-xl h-32 resize-none focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:outline-none focus:border-[var(--color-gigas-500)] transition-all placeholder-[var(--color-gigas-500)]"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-2">Date de sortie</label>
            <input v-model="releaseDate" type="date"
                   class="w-full px-5 py-3.5 bg-[var(--color-gigas-800)]/60 backdrop-blur-sm text-white border border-[var(--color-gigas-700)]/50 rounded-xl focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:outline-none focus:border-[var(--color-gigas-500)] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-2">Durée (min)</label>
            <input v-model="duration" type="number" placeholder="120"
                   class="w-full px-5 py-3.5 bg-[var(--color-gigas-800)]/60 backdrop-blur-sm text-white border border-[var(--color-gigas-700)]/50 rounded-xl focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:outline-none focus:border-[var(--color-gigas-500)] transition-all placeholder-[var(--color-gigas-500)]" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-2">Budget ($)</label>
          <input v-model="budget" type="number" placeholder="10000000"
                 class="w-full px-5 py-3.5 bg-[var(--color-gigas-800)]/60 backdrop-blur-sm text-white border border-[var(--color-gigas-700)]/50 rounded-xl focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:outline-none focus:border-[var(--color-gigas-500)] transition-all placeholder-[var(--color-gigas-500)]" />
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-3">Acteurs ({{ selectedActors.length }} sélectionné{{ selectedActors.length > 1 ? 's' : '' }})</label>
          <div class="bg-[var(--color-gigas-800)]/60 backdrop-blur-sm border border-[var(--color-gigas-700)]/50 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
            <div v-for="actor in allActors" :key="actor.id"
                 class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-gigas-700)]/60 transition-all cursor-pointer group"
                 @click="toggleActor(actor.id)">
              <div class="relative w-6 h-6 flex items-center justify-center border-2 rounded-lg transition-all"
                   :class="selectedActors.includes(actor.id)
                     ? 'bg-gradient-to-br from-[var(--color-gigas-600)] to-[var(--color-gigas-500)] border-[var(--color-gigas-500)] scale-105'
                     : 'bg-[var(--color-gigas-800)] border-[var(--color-gigas-600)] group-hover:border-[var(--color-gigas-500)]'">
                <svg v-if="selectedActors.includes(actor.id)" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-white font-medium group-hover:text-[var(--color-gigas-300)] transition-colors">
                {{ actor.firstname }} {{ actor.lastname }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="errors" class="bg-red-900/40 border border-red-700/50 backdrop-blur-sm text-red-300 p-4 rounded-xl text-sm flex items-start gap-3">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span>{{ errors }}</span>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--color-gigas-700)]/50">
        <button @click="emit('close')"
                class="px-6 py-3 bg-[var(--color-gigas-800)]/60 hover:bg-[var(--color-gigas-700)]/80 text-[var(--color-gigas-200)] rounded-xl transition-all active:scale-95 font-medium border border-[var(--color-gigas-700)]/50">
          Annuler
        </button>
        <button @click="saveMovie" :disabled="loading"
                class="px-8 py-3 bg-gradient-to-r from-[var(--color-gigas-600)] to-[var(--color-gigas-500)] hover:from-[var(--color-gigas-500)] hover:to-[var(--color-gigas-400)] text-white rounded-xl transition-all active:scale-95 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-gigas-600)]/30 flex items-center gap-2">
          <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.4s ease-out;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--color-gigas-900);
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-gigas-700);
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-gigas-600);
}
</style>