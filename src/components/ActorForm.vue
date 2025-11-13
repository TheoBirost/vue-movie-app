<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '/src/api/api.js'

const emit = defineEmits(['close', 'refresh'])
const props = defineProps({ actor: Object })

const firstname = ref('')
const lastname = ref('')
const dob = ref('')
const dod = ref('')
const bio = ref('')
const selectedMovies = ref([])
const allMovies = ref([])
const loading = ref(false)
const errors = ref(null)

const initFromActor = (a) => {
  if (!a) {
    firstname.value = ''
    lastname.value = ''
    dob.value = ''
    dod.value = ''
    bio.value = ''
    selectedMovies.value = []
    return
  }
  firstname.value = a.firstname || ''
  lastname.value = a.lastname || ''
  dob.value = a.dob || ''
  dod.value = a.dod || ''
  bio.value = a.bio || ''
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
    const actorData = {
      firstname: firstname.value,
      lastname: lastname.value,
      dob: dob.value,
      dod: dod.value || null,
      bio: bio.value
    }

    if (props.actor?.id) {
      await api.patch(`/actors/${props.actor.id}`, actorData, { headers: { 'Content-Type': 'application/merge-patch+json' } })

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
        await api.patch(`/movies/${movieId}`, { actors: movieActors }, { headers: { 'Content-Type': 'application/merge-patch+json' } })
      }

      for (const movieId of toAdd) {
        const movieRes = await api.get(`/movies/${movieId}`)
        const movieActors = (movieRes.data.actors || [])
            .map(a => typeof a === 'string' ? a : `/api/actors/${a.id}`)
        if (!movieActors.includes(`/api/actors/${props.actor.id}`)) {
          movieActors.push(`/api/actors/${props.actor.id}`)
        }
        await api.patch(`/movies/${movieId}`, { actors: movieActors }, { headers: { 'Content-Type': 'application/merge-patch+json' } })
      }

    } else {
      const response = await api.post('/actors', actorData, { headers: { 'Content-Type': 'application/ld+json' } })
      const newActorId = response.data.id
      for (const movieId of selectedMovies.value) {
        const movieRes = await api.get(`/movies/${movieId}`)
        const movieActors = (movieRes.data.actors || [])
            .map(a => typeof a === 'string' ? a : `/api/actors/${a.id}`)
        movieActors.push(`/api/actors/${newActorId}`)
        await api.patch(`/movies/${movieId}`, { actors: movieActors }, { headers: { 'Content-Type': 'application/merge-patch+json' } })
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
        <h2 class="text-3xl font-bold bg-gradient-to-r from-[var(--color-gigas-200)] to-[var(--color-gigas-400)] bg-clip-text text-transparent">
          {{ props.actor ? 'Modifier l\'acteur' : 'Nouvel acteur' }}
        </h2>
        <button @click="emit('close')" class="p-2 hover:bg-[var(--color-gigas-800)]/60 rounded-xl transition-all text-[var(--color-gigas-300)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-2">Prénom</label>
            <input v-model="firstname" placeholder="Ex: Leonardo"
                   class="w-full px-5 py-3.5 bg-[var(--color-gigas-800)]/60 backdrop-blur-sm text-white border border-[var(--color-gigas-700)]/50 rounded-xl focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:outline-none focus:border-[var(--color-gigas-500)] transition-all placeholder-[var(--color-gigas-500)]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-2">Nom</label>
            <input v-model="lastname" placeholder="Ex: DiCaprio"
                   class="w-full px-5 py-3.5 bg-[var(--color-gigas-800)]/60 backdrop-blur-sm text-white border border-[var(--color-gigas-700)]/50 rounded-xl focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:outline-none focus:border-[var(--color-gigas-500)] transition-all placeholder-[var(--color-gigas-500)]" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-2">Date de naissance</label>
            <input v-model="dob" type="date"
                   class="w-full px-5 py-3.5 bg-[var(--color-gigas-800)]/60 backdrop-blur-sm text-white border border-[var(--color-gigas-700)]/50 rounded-xl focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:outline-none focus:border-[var(--color-gigas-500)] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-2">Date de décès (facultatif)</label>
            <input v-model="dod" type="date"
                   class="w-full px-5 py-3.5 bg-[var(--color-gigas-800)]/60 backdrop-blur-sm text-white border border-[var(--color-gigas-700)]/50 rounded-xl focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:outline-none focus:border-[var(--color-gigas-500)] transition-all" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-2">Biographie</label>
          <textarea v-model="bio" placeholder="Racontez l'histoire de cet acteur..."
                    class="w-full px-5 py-3.5 bg-[var(--color-gigas-800)]/60 backdrop-blur-sm text-white border border-[var(--color-gigas-700)]/50 rounded-xl h-32 resize-none focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:outline-none focus:border-[var(--color-gigas-500)] transition-all placeholder-[var(--color-gigas-500)]"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--color-gigas-300)] mb-3">Films ({{ selectedMovies.length }} sélectionné{{ selectedMovies.length > 1 ? 's' : '' }})</label>
          <div class="bg-[var(--color-gigas-800)]/60 backdrop-blur-sm border border-[var(--color-gigas-700)]/50 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
            <div v-for="movie in allMovies" :key="movie.id"
                 class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-gigas-700)]/60 transition-all cursor-pointer group"
                 @click="toggleMovie(movie.id)">
              <div class="relative w-6 h-6 flex items-center justify-center border-2 rounded-lg transition-all"
                   :class="selectedMovies.includes(movie.id)
                     ? 'bg-gradient-to-br from-[var(--color-gigas-600)] to-[var(--color-gigas-500)] border-[var(--color-gigas-500)] scale-105'
                     : 'bg-[var(--color-gigas-800)] border-[var(--color-gigas-600)] group-hover:border-[var(--color-gigas-500)]'">
                <svg v-if="selectedMovies.includes(movie.id)" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-white font-medium group-hover:text-[var(--color-gigas-300)] transition-colors">
                {{ movie.name }}
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
        <button @click="saveActor" :disabled="loading"
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