<script setup>
import { ref, onMounted, watch } from 'vue'
import { gsap } from 'gsap'
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
  releaseDate.value = m.releaseDate ? m.releaseDate.split('T')[0] : ''
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
    const res = await api.get('/actors', { params: { pagination: false } })
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
  gsap.from('.form-container', {
    opacity: 0,
    y: 50,
    duration: 0.5,
    ease: 'power3.out'
  })
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
      duration: duration.value,
      actors: selectedActors.value.map(id => `/api/actors/${id}`)
    }

    if (props.movie?.id) {
      await api.patch(`/movies/${props.movie.id}`, movieData, { headers: { 'Content-Type': 'application/merge-patch+json' } })
    } else {
      await api.post('/movies', movieData, { headers: { 'Content-Type': 'application/ld+json' } })
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
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="emit('close')">
    <div class="form-container bg-[#16181E] border border-[#2A2D36] rounded-lg w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
      <header class="p-6 flex items-center justify-between border-b border-[#2A2D36]">
        <h2 class="garamond text-2xl font-bold text-white">
          {{ props.movie ? 'Modifier le film' : 'Nouveau film' }}
        </h2>
        <button @click="emit('close')" class="p-2 rounded-full text-[#82828A] hover:bg-white/10" aria-label="Fermer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </header>

      <main class="p-6 space-y-6 overflow-y-auto">
        <div>
          <label for="movie-title" class="block text-sm font-medium text-[#C1C1C7] mb-1">Titre</label>
          <input id="movie-title" v-model="title" type="text" placeholder="ex: Inception" class="w-full px-4 py-2 bg-[#0d0d0f] border border-[#2A2D36] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]" />
        </div>

        <div>
          <label for="movie-description" class="block text-sm font-medium text-[#C1C1C7] mb-1">Description</label>
          <textarea id="movie-description" v-model="description" placeholder="Décrivez l'intrigue du film..." rows="4" class="w-full px-4 py-2 bg-[#0d0d0f] border border-[#2A2D36] rounded-md resize-y text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="movie-release-date" class="block text-sm font-medium text-[#C1C1C7] mb-1">Date de sortie</label>
            <input id="movie-release-date" v-model="releaseDate" type="date" class="w-full px-4 py-2 bg-[#0d0d0f] border border-[#2A2D36] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]" />
          </div>
          <div>
            <label for="movie-duration" class="block text-sm font-medium text-[#C1C1C7] mb-1">Durée (minutes)</label>
            <input id="movie-duration" v-model="duration" type="number" placeholder="120" class="w-full px-4 py-2 bg-[#0d0d0f] border border-[#2A2D36] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]" />
          </div>
        </div>

        <div>
          <label for="movie-budget" class="block text-sm font-medium text-[#C1C1C7] mb-1">Budget ($)</label>
          <input id="movie-budget" v-model="budget" type="number" placeholder="10000000" class="w-full px-4 py-2 bg-[#0d0d0f] border border-[#2A2D36] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]" />
        </div>

        <div>
          <label class="block text-sm font-medium text-[#C1C1C7] mb-1">Acteurs ({{ selectedActors.length }} sélectionné{{ selectedActors.length > 1 ? 's' : '' }})</label>
          <div class="bg-[#0d0d0f] border border-[#2A2D36] rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
            <label v-for="actor in allActors" :key="actor.id" class="flex items-center gap-3 p-2 rounded-md hover:bg-[#1E2129] cursor-pointer">
              <input type="checkbox" :value="actor.id" :checked="selectedActors.includes(actor.id)" @change="toggleActor(actor.id)" class="w-4 h-4 rounded border-[#2A2D36] bg-[#0d0d0f] text-[#FFD700] focus:ring-[#FFD700]" />
              <span class="text-white">{{ actor.firstname }} {{ actor.lastname }}</span>
            </label>
          </div>
        </div>

        <div v-if="errors" class="bg-red-900/20 border border-red-800/30 text-red-400 p-3 rounded-md text-sm">
          {{ errors }}
        </div>
      </main>

      <footer class="p-6 flex justify-end gap-4 border-t border-[#2A2D36]">
        <button @click="emit('close')" class="px-6 py-2.5 rounded-lg text-sm font-bold text-[#C1C1C7] border border-[#2A2D36] hover:bg-white/10 transition-colors">
          Annuler
        </button>
        <button @click="saveMovie" :disabled="loading" class="px-6 py-2.5 rounded-lg text-sm font-bold text-black bg-[#FFD700] hover:bg-[#FFE55C] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
        </button>
      </footer>
    </div>
  </div>
</template>
