<script setup>
import { ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import api from '/src/api/api.js'
import ActorForm from "/src/components/ActorForm.vue"
import ConfirmDeleteActor from "/src/components/ConfirmDeleteActor.vue"
import MovieCard from "../components/MovieCard.vue";
import ActorCard from "../components/ActorCard.vue";

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

    actors.value = res.data.member || []
    const totalItems = res.data.totalItems || 0
    totalPages.value = Math.max(1, Math.ceil(totalItems / limit))
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status} : ${err.response.data.message || "Non spécifié"}`
    } else if (err.request) {
      errorMessage.value = "Aucun Acteur trouvé"
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
    console.error("Erreur suppression :", err)
  }
}

watch(page, fetchActors)

let searchTimeout = null
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchActors()
  }, 150)
})

onMounted(fetchActors)

const userRole = ref('')

onMounted(async () => {
  try {
    const res = await api.get(import.meta.env.VITE_API_URL_USER)
    userRole.value = res.data.roles[0] || 'aucun rôle'
  } catch (err) {

  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50">
    <section class="max-w-7xl mx-auto px-6 py-12">
      <div class="mb-12">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <h1 class="text-5xl font-semibold text-gray-900 tracking-tight">
            Rechercher un acteur
          </h1>
          <button
              @click="selectedActor = null; showForm = true"
              v-if="userRole === 'ROLE_ADMIN'"
              class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-1"
          >
            <span class="font-bold text-2xl"> + </span>
            Ajouter un acteur
          </button>
        </div>

        <div class="relative">
          <input
              v-model="search"
              placeholder="Rechercher un acteur..."
              class="w-full px-6 py-4 bg-gray-100 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
          />
          <span class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
          </span>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20">
        <p class="text-gray-400 text-lg animate-pulse">Chargement...</p>
      </div>

      <div
          v-else-if="actors.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
      >
        <div v-for="actor in actors" :key="actor.id" class="group">
          <div @click="goToActor(actor.id)" class="cursor-pointer mb-4">
      <!--      <div class="relative overflow-hidden rounded-2xl bg-gray-100 mb-3">
              <img
                  :src="actor.photo?.url || '/img/default-actor.jpg'"
                  :alt="`${actor.firstname} ${actor.lastname}`"
                  class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                  class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"
              ></div>
            </div>

            <div class="px-1">
              <h3 class="font-semibold text-gray-900 text-base">
                {{ actor.firstname }}
              </h3>
              <p class="text-gray-900 text-base">
                {{ actor.lastname }}
              </p>
            </div>
      -->
            <ActorCard :actor="actor" />
          </div>

          <div class="flex gap-2" v-if="userRole === 'ROLE_ADMIN'">
            <button
                @click.stop="editActor(actor)"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 text-sm"
            >
              Modifier
            </button>

            <button
                @click.stop="confirmDelete(actor)"
                class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 text-sm"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-gray-400 text-lg">
          {{errorMessage || "Aucun acteur trouvé"}}
        </p>
      </div>
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-16">
        <button
            :disabled="page === 1"
            @click="page > 1 && page--"
            class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 transition-all duration-200 active:scale-95 flex items-center justify-center"
        >
          ◀
        </button>

        <span class="text-gray-600 font-medium min-w-[120px] text-center">
          Page {{ page }} sur {{ totalPages }}
        </span>

        <button
            :disabled="page === totalPages"
            @click="page < totalPages && page++"
            class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 transition-all duration-200 active:scale-95 flex items-center justify-center"
        >
          ▶
        </button>
      </div>
    </section>

    <ActorForm
        v-if="showForm"
        :actor="selectedActor"
        @close="showForm = false"
        @refresh="fetchActors"
    />

    <ConfirmDeleteActor
        v-if="showConfirm"
        :actor="actorToDelete"
        @cancel="showConfirm = false"
        @confirm="deleteActor"
    />
  </div>
</template>
