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
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="emit('close')">
    <div class="bg-color-surface border border-color-border rounded-lg w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col" data-aos="fade-up">
      <header class="p-6 flex items-center justify-between border-b border-color-border">
        <h2 class="text-2xl font-gloock font-bold text-color-heading">
          {{ props.actor ? 'Edit Actor' : 'New Actor' }}
        </h2>
        <button @click="emit('close')" class="p-2 rounded-full hover:bg-color-bg dark:hover:bg-color-surface text-color-text" aria-label="Close form">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </header>

      <main class="p-6 space-y-6 overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="actor-firstname" class="block text-sm font-medium text-color-text mb-1">First Name</label>
            <input id="actor-firstname" v-model="firstname" type="text" placeholder="e.g., Leonardo" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
          </div>
          <div>
            <label for="actor-lastname" class="block text-sm font-medium text-color-text mb-1">Last Name</label>
            <input id="actor-lastname" v-model="lastname" type="text" placeholder="e.g., DiCaprio" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="actor-dob" class="block text-sm font-medium text-color-text mb-1">Date of Birth</label>
            <input id="actor-dob" v-model="dob" type="date" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
          </div>
          <div>
            <label for="actor-dod" class="block text-sm font-medium text-color-text mb-1">Date of Death (optional)</label>
            <input id="actor-dod" v-model="dod" type="date" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
          </div>
        </div>

        <div>
          <label for="actor-bio" class="block text-sm font-medium text-color-text mb-1">Biography</label>
          <textarea id="actor-bio" v-model="bio" placeholder="Tell the story of this actor..." rows="4" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-color-primary"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-color-text mb-1">Movies ({{ selectedMovies.length }} selected)</label>
          <div class="bg-color-bg border border-color-border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
            <label v-for="movie in allMovies" :key="movie.id" class="flex items-center gap-3 p-2 rounded-md hover:bg-color-border dark:hover:bg-color-surface cursor-pointer">
              <input type="checkbox" :value="movie.id" :checked="selectedMovies.includes(movie.id)" @change="toggleMovie(movie.id)" class="w-4 h-4 rounded border-color-border text-color-primary focus:ring-color-primary" />
              <span class="text-color-heading">{{ movie.name }}</span>
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
        <button @click="saveActor" :disabled="loading" class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Saving...' : 'Save Actor' }}
        </button>
      </footer>
    </div>
  </div>
</template>
