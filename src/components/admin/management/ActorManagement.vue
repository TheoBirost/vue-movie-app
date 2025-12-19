<script setup>
import { ref, onMounted, computed } from "vue"
import { useDataStore } from '../../../stores/useDataStore'
import ActorForm from "../forms/ActorForm.vue"
import ConfirmDeleteActor from "../modals/ConfirmDeleteActor.vue"
import api from '../../../api/api'

const dataStore = useDataStore()

const loading = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const selectedActor = ref(null)
const actorToDelete = ref(null)

const actors = computed(() => dataStore.actors)

const fetchActors = async (force = false) => {
  loading.value = true
  try {
    await dataStore.fetchActors(force)
  } catch (err) {
    console.error("Erreur lors du chargement des données :", err);
  } finally {
    loading.value = false
  }
}

const editActor = (actor) => {
  selectedActor.value = { ...actor }
  showForm.value = true
}

const confirmDelete = (actor) => {
  actorToDelete.value = actor
  showConfirm.value = true
}

const deleteActor = async () => {
  if (!actorToDelete.value) return;
  try {
    await api.delete(`/actors/${actorToDelete.value.id}`)
    dataStore.removeActorById(actorToDelete.value.id);
    showConfirm.value = false
    actorToDelete.value = null
  } catch (err) {
    console.error("Erreur suppression :", err)
  }
}

const onFormSaved = async () => {
  showForm.value = false;
  await fetchActors(true);
};

onMounted(async () => {
  await fetchActors()
})
</script>

<template>
  <div class="universal-card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="garamond text-3xl font-bold text-white">Manage Actors</h2>
      <button
        @click="selectedActor = null; showForm = true"
        class="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-widest uppercase"
      >
        + Add Actor
      </button>
    </div>
    <div v-if="loading" class="text-center py-10">
      <p class="text-text-gray">Loading actors...</p>
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
          <tr v-for="actor in actors" :key="actor.id" class="border-b border-border hover:bg-bg-hover">
            <td class="p-4 text-text-white">{{ actor.firstname }} {{ actor.lastname }}</td>
            <td class="p-4 text-right">
              <button @click="editActor(actor)" class="text-gold hover:text-gold-light font-semibold transition-colors mr-4">Edit</button>
              <button @click="confirmDelete(actor)" class="text-red-500 hover:text-red-400 font-semibold transition-colors">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ActorForm
      v-if="showForm"
      :actor="selectedActor"
      @close="showForm = false"
      @refresh="onFormSaved"
    />
    <ConfirmDeleteActor
      v-if="showConfirm"
      :actor="actorToDelete"
      @cancel="showConfirm = false"
      @confirm="deleteActor"
    />
  </div>
</template>
