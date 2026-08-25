<script setup>
import { ref, onMounted, computed } from "vue"
import DirectorForm from "../forms/DirectorForm.vue"
import ConfirmDeleteDirector from "../modals/ConfirmDeleteDirector.vue"
import api from '../../../api/api'
import { logger } from '../../../utils/logger'

const loading = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const selectedDirector = ref(null)
const directorToDelete = ref(null)
const directors = ref([])

// Pagination
const page = ref(1)
const totalItems = ref(0)
const itemsPerPage = 30

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const fetchDirectors = async () => {
  loading.value = true
  try {
    const response = await api.get('/directors', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage,
        'groups[]': ['director:read']
      }
    })
    const data = response.data
    directors.value = data['hydra:member'] || data['member'] || []
    totalItems.value = data['hydra:totalItems'] || data['totalItems'] || directors.value.length
  } catch (err) {
    logger.error('Erreur lors du chargement des réalisateurs', err);
  } finally {
    loading.value = false
  }
}

const editDirector = (director) => {
  selectedDirector.value = { ...director }
  showForm.value = true
}

const confirmDelete = (director) => {
  directorToDelete.value = director
  showConfirm.value = true
}

const deleteDirector = async () => {
  if (!directorToDelete.value) return;
  try {
    await api.delete(`/directors/${directorToDelete.value.id}`)
    showConfirm.value = false
    directorToDelete.value = null
    fetchDirectors()
  } catch (err) {
    logger.error('Erreur suppression', err)
  }
}

const onFormSaved = async () => {
  showForm.value = false;
  await fetchDirectors();
};

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
    fetchDirectors()
  }
}

onMounted(async () => {
  await fetchDirectors()
})
</script>

<template>
  <div class="universal-card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold text-[var(--color-ink)]">Gestion des Réalisateurs</h2>
      <div class="flex items-center gap-4">
        <span class="text-sm text-text-gray">Total: <span class="text-gold font-bold">{{ totalItems }}</span></span>
        <button
          @click="selectedDirector = null; showForm = true"
          class="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-widest uppercase"
        >
          + Ajouter
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="flex justify-center gap-2 mb-2">
          <div class="w-2 h-2 bg-gold rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-gold rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-gold rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
      <p class="text-text-gray text-sm">Chargement des réalisateurs...</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="border-b border-border bg-bg-main/50">
          <tr>
            <th class="p-4 text-xs font-bold text-text-gray uppercase tracking-widest">Nom</th>
            <th class="p-4 text-xs font-bold text-text-gray uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="director in directors" :key="director.id" class="border-b border-border hover:bg-white/5 transition-colors">
            <td class="p-4 text-[var(--color-ink)] font-medium">{{ director.firstname }} {{ director.lastname }}</td>
            <td class="p-4 text-right">
              <button @click="editDirector(director)" class="text-gold hover:text-[var(--color-ink)] text-xs font-bold uppercase tracking-wider transition-colors border border-gold/30 hover:bg-gold/10 px-3 py-1.5 rounded mr-2">
                Modifier
              </button>
              <button @click="confirmDelete(director)" class="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-colors border border-red-900/50 hover:bg-red-900/20 px-3 py-1.5 rounded">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-border">
        <button
          @click="changePage(page - 1)"
          :disabled="page === 1"
          class="px-4 py-2 bg-[var(--color-paper-raised)] border border-[var(--color-rule)] rounded text-[var(--color-ink)] hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Précédent
        </button>
        <span class="text-text-gray text-sm">Page <span class="text-gold font-bold">{{ page }}</span> sur {{ totalPages }}</span>
        <button
          @click="changePage(page + 1)"
          :disabled="page === totalPages"
          class="px-4 py-2 bg-[var(--color-paper-raised)] border border-[var(--color-rule)] rounded text-[var(--color-ink)] hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Suivant
        </button>
      </div>
    </div>

    <DirectorForm
      v-if="showForm"
      :director="selectedDirector"
      @close="showForm = false"
      @refresh="onFormSaved"
    />
    <ConfirmDeleteDirector
      v-if="showConfirm"
      @cancel="showConfirm = false"
      @confirm="deleteDirector"
    />
  </div>
</template>
