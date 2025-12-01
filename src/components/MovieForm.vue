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
            .map(m => typeof m === 'string' ? m : `/api/actors/${m.id}`)

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
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="emit('close')">
    <div class="bg-color-surface border border-color-border rounded-lg w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col" data-aos="fade-up">
      <header class="p-6 flex items-center justify-between border-b border-color-border">
        <h2 class="text-2xl font-gloock font-bold text-color-heading">
          {{ props.movie ? 'Edit Movie' : 'New Movie' }}
        </h2>
        <button @click="emit('close')" class="p-2 rounded-full hover:bg-color-bg dark:hover:bg-color-surface text-color-text" aria-label="Close form">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </header>

      <main class="p-6 space-y-6 overflow-y-auto">
        <div>
          <label for="movie-title" class="block text-sm font-medium text-color-text mb-1">Title</label>
          <input id="movie-title" v-model="title" type="text" placeholder="e.g., Inception" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
        </div>

        <div>
          <label for="movie-description" class="block text-sm font-medium text-color-text mb-1">Description</label>
          <textarea id="movie-description" v-model="description" placeholder="Describe the movie's plot..." rows="4" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-color-primary"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="movie-release-date" class="block text-sm font-medium text-color-text mb-1">Release Date</label>
            <input id="movie-release-date" v-model="releaseDate" type="date" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
          </div>
          <div>
            <label for="movie-duration" class="block text-sm font-medium text-color-text mb-1">Duration (minutes)</label>
            <input id="movie-duration" v-model="duration" type="number" placeholder="120" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
          </div>
        </div>

        <div>
          <label for="movie-budget" class="block text-sm font-medium text-color-text mb-1">Budget ($)</label>
          <input id="movie-budget" v-model="budget" type="number" placeholder="10000000" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
        </div>

        <div>
          <label class="block text-sm font-medium text-color-text mb-1">Actors ({{ selectedActors.length }} selected)</label>
          <div class="bg-color-bg border border-color-border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
            <label v-for="actor in allActors" :key="actor.id" class="flex items-center gap-3 p-2 rounded-md hover:bg-color-border dark:hover:bg-color-surface cursor-pointer">
              <input type="checkbox" :value="actor.id" :checked="selectedActors.includes(actor.id)" @change="toggleActor(actor.id)" class="w-4 h-4 rounded border-color-border text-color-primary focus:ring-color-primary" />
              <span class="text-color-heading">{{ actor.firstname }} {{ actor.lastname }}</span>
            </label>
          </div>
        </div>

        <div v-if="errors" class="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-sm">
          {{ errors }}
        </div>
      </main>

      <footer class="p-6 flex justify-end gap-4 border-t border-color-border">
        <button @click="emit('close')" class="btn-secondary">
          Cancel
        </button>
        <button @click="saveMovie" :disabled="loading" class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Saving...' : 'Save Movie' }}
        </button>
      </footer>
    </div>
  </div>
</template>
