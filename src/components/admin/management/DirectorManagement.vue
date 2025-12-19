<script setup>
import { ref, onMounted, computed } from "vue"
import { useDataStore } from '../../../stores/useDataStore'
import DirectorForm from "../forms/DirectorForm.vue"
import ConfirmDeleteDirector from "../modals/ConfirmDeleteDirector.vue"
import api from '../../../api/api'

const dataStore = useDataStore()

const loading = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const selectedDirector = ref(null)
const directorToDelete = ref(null)

const directors = computed(() => dataStore.directors)

const fetchDirectors = async (force = false) => {
  loading.value = true
  try {
    await dataStore.fetchDirectors(force)
  } catch (err) {
    console.error("Erreur lors du chargement des données :", err);
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
    dataStore.directors = dataStore.directors.filter(d => d.id !== directorToDelete.value.id)
    showConfirm.value = false
    directorToDelete.value = null
  } catch (err) {
    console.error("Erreur suppression :", err)
  }
}

const onFormSaved = async () => {
  showForm.value = false;
  await fetchDirectors(true);
};

onMounted(async () => {
  await fetchDirectors()
})
</script>

<template>
  <div class="universal-card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="garamond text-3xl font-bold text-white">Manage Directors</h2>
      <button
        @click="selectedDirector = null; showForm = true"
        class="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-widest uppercase"
      >
        + Add Director
      </button>
    </div>
    <div v-if="loading" class="text-center py-10">
      <p class="text-text-gray">Loading directors...</p>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="border-b border-border">
          <tr>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider">Name</th>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="director in directors" :key="director.id" class="border-b border-border hover:bg-bg-hover">
            <td class="p-4 text-text-white">{{ director.firstname }} {{ director.lastname }}</td>
            <td class="p-4 text-right">
              <button @click="editDirector(director)" class="text-gold hover:text-gold-light font-semibold transition-colors mr-4">Edit</button>
              <button @click="confirmDelete(director)" class="text-red-500 hover:text-red-400 font-semibold transition-colors">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
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
