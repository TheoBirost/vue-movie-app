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
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4" @click.self="emit('close')">
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">
          {{ props.movie ? 'Modifier le film' : 'Nouveau film' }}
        </h2>
        <button @click="emit('close')" class="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition text-[var(--text-gray)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Titre du film</label>
          <input v-model="title" placeholder="Ex: Inception"
                 class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Description</label>
          <textarea v-model="description" placeholder="Décrivez l'intrigue du film..."
                    class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg h-32 resize-none focus:outline-none focus:border-[var(--gold)] transition"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Date de sortie</label>
            <input v-model="releaseDate" type="date"
                   class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Durée (min)</label>
            <input v-model="duration" type="number" placeholder="120"
                   class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Budget ($)</label>
          <input v-model="budget" type="number" placeholder="10000000"
                 class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">
            Acteurs ({{ selectedActors.length }} sélectionné{{ selectedActors.length > 1 ? 's' : '' }})
          </label>
          <div class="bg-[var(--bg-main)] border border-[var(--border)] rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
            <div v-for="actor in allActors" :key="actor.id"
                 class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition cursor-pointer"
                 @click="toggleActor(actor.id)">
              <input type="checkbox" :checked="selectedActors.includes(actor.id)" class="w-4 h-4 rounded border-[var(--border)] text-[var(--gold)] focus:ring-[var(--gold)]" />
              <span class="text-white">{{ actor.firstname }} {{ actor.lastname }}</span>
            </div>
          </div>
        </div>

        <div v-if="errors" class="bg-red-900/20 border border-red-800/30 text-red-400 p-3 rounded-lg text-sm">
          {{ errors }}
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--border)]">
        <button @click="emit('close')"
                class="px-5 py-3 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-gray)] rounded-lg transition font-medium">
          Annuler
        </button>
        <button @click="saveMovie" :disabled="loading"
                class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>