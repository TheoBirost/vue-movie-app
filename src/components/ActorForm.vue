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
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4" @click.self="emit('close')">
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">
          {{ props.actor ? 'Modifier l\'acteur' : 'Nouvel acteur' }}
        </h2>
        <button @click="emit('close')" class="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition text-[var(--text-gray)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Prénom</label>
            <input v-model="firstname" placeholder="Ex: Leonardo"
                   class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Nom</label>
            <input v-model="lastname" placeholder="Ex: DiCaprio"
                   class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Date de naissance</label>
            <input v-model="dob" type="date"
                   class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Date de décès (facultatif)</label>
            <input v-model="dod" type="date"
                   class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Biographie</label>
          <textarea v-model="bio" placeholder="Racontez l'histoire de cet acteur..."
                    class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg h-32 resize-none focus:outline-none focus:border-[var(--gold)] transition"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">
            Films ({{ selectedMovies.length }} sélectionné{{ selectedMovies.length > 1 ? 's' : '' }})
          </label>
          <div class="bg-[var(--bg-main)] border border-[var(--border)] rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
            <div v-for="movie in allMovies" :key="movie.id"
                 class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition cursor-pointer"
                 @click="toggleMovie(movie.id)">
              <input type="checkbox" :checked="selectedMovies.includes(movie.id)" class="w-4 h-4 rounded border-[var(--border)] text-[var(--gold)] focus:ring-[var(--gold)]" />
              <span class="text-white">{{ movie.name }}</span>
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
        <button @click="saveActor" :disabled="loading"
                class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>