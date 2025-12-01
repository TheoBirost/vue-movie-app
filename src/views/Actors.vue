<script setup>
import { ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import api from "/src/api/api.js"
import ActorForm from "/src/components/ActorForm.vue"
import ConfirmDeleteActor from "/src/components/ConfirmDeleteActor.vue"
import ActorCard from "../components/ActorCard.vue"

const router = useRouter()

const actors = ref([])
const search = ref("")
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const errorMessage = ref("")
const showForm = ref(false)
const showConfirm = ref(false)
const selectedActor = ref(null)
const actorToDelete = ref(null)
const userRole = ref("")

const limit = 12

const fetchActors = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const res = await api.get("/actors", {
      params: {
        page: page.value,
        itemsPerPage: limit,
        "order[id]": "desc",
        firstname: search.value || undefined,
      },
    })

    actors.value = res.data["hydra:member"] || res.data.member || []
    const totalItems = res.data["hydra:totalItems"] || res.data.totalItems || actors.value.length
    totalPages.value = Math.max(1, Math.ceil(totalItems / limit))
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status}`
    } else if (err.request) {
      errorMessage.value = "Impossible de joindre le serveur"
    } else {
      errorMessage.value = err.message
    }
  } finally {
    loading.value = false
  }
}

const goToActor = (id) => router.push(`/actors/${id}`)

const editActor = (actor) => {
  selectedActor.value = { ...actor }
  showForm.value = true
}

const confirmDelete = (actor) => {
  actorToDelete.value = actor
  showConfirm.value = true
}

const deleteActor = async () => {
  try {
    await api.delete(`/actors/${actorToDelete.value.id}`)
    showConfirm.value = false
    actorToDelete.value = null
    await fetchActors()
  } catch (err) {
    console.error("Erreur lors de la suppression :", err)
  }
}

watch(page, fetchActors)

let searchTimeout
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchActors()
  }, 300)
})

onMounted(async () => {
  await fetchActors()
  try {
    const res = await api.get(import.meta.env.VITE_API_URL_USER)
    userRole.value = res.data.roles?.[0] || "aucun rôle"
  } catch (err) {
    console.error("Erreur récupération rôle :", err)
  }
})
</script>

<template>
  <div class="min-h-screen bg-color-bg text-color-text">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header class="flex flex-col md:flex-row justify-between items-center mb-12" data-aos="fade-down">
        <div class="text-center md:text-left mb-8 md:mb-0">
          <h1 class="text-5xl font-gloock font-bold text-color-heading mb-2">All Actors</h1>
          <p class="text-lg text-color-text">Meet the talents behind the screen.</p>
        </div>
        <button
          v-if="userRole === 'ROLE_ADMIN'"
          @click="selectedActor = null; showForm = true"
          class="btn-primary"
        >
          + Add Actor
        </button>
      </header>

      <div class="mb-12" data-aos="fade-down">
        <input
          v-model="search"
          type="text"
          placeholder="Search for an actor..."
          class="w-full px-5 py-3 bg-color-surface border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary transition-all"
        />
      </div>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="w-16 h-16 border-4 border-color-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="errorMessage" class="text-center py-16 text-red-500" data-aos="fade-up">
        <p>{{ errorMessage }}</p>
      </div>

      <div v-else-if="actors.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div v-for="actor in actors" :key="actor.id" data-aos="fade-up">
            <ActorCard :actor="actor" @click="goToActor(actor.id)" />
            <div v-if="userRole === 'ROLE_ADMIN'" class="flex gap-2 mt-4">
              <button @click.stop="editActor(actor)" class="w-full py-2 px-4 btn-secondary">Edit</button>
              <button @click.stop="confirmDelete(actor)" class="w-full py-2 px-4 btn-danger">Delete</button>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="flex justify-center items-center space-x-4">
          <button @click="page--" :disabled="page === 1" class="btn-secondary">
            &larr; Previous
          </button>
          <span class="text-color-text">Page {{ page }} of {{ totalPages }}</span>
          <button @click="page++" :disabled="page === totalPages" class="btn-secondary">
            Next &rarr;
          </button>
        </div>
      </div>

      <div v-else class="text-center py-20" data-aos="fade-up">
        <p class="text-color-text text-lg">No actors found. Try a different search.</p>
      </div>
    </div>

    <ActorForm v-if="showForm" :actor="selectedActor" @close="showForm = false" @refresh="fetchActors" />
    <ConfirmDeleteActor v-if="showConfirm" :actor="actorToDelete" @cancel="showConfirm = false" @confirm="deleteActor" />
  </div>
</template>
