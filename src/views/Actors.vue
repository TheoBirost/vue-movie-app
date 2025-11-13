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
  <div class="min-h-screen bg-[var(--bg-main)]">
    <div class="max-w-7xl mx-auto px-6 py-16 space-y-12">

      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-5xl font-bold text-white mb-2">Acteurs</h1>
          <p class="text-[var(--text-gray)]">Les talents du cinéma</p>
        </div>

        <button
            v-if="userRole === 'ROLE_ADMIN'"
            @click="selectedActor = null; showForm = true"
            class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black font-semibold rounded-lg transition"
        >
          + Ajouter
        </button>
      </div>

      <input
          v-model="search"
          placeholder="Rechercher un acteur..."
          class="w-full px-4 py-3 bg-[var(--bg-card)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition"
      />

      <div v-if="loading" class="text-center py-20">
        <div class="flex gap-2 justify-center">
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <div v-else-if="actors.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="actor in actors" :key="actor.id">
          <div @click="goToActor(actor.id)">
            <ActorCard :actor="actor" />
          </div>

          <div v-if="userRole === 'ROLE_ADMIN'" class="flex gap-2 mt-3">
            <button
                @click.stop="editActor(actor)"
                class="flex-1 px-3 py-2 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-gray)] text-sm rounded-lg transition"
            >
              Modifier
            </button>
            <button
                @click.stop="confirmDelete(actor)"
                class="flex-1 px-3 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 text-sm rounded-lg transition"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-[var(--text-gray)] text-lg">{{ errorMessage || "Aucun acteur trouvé" }}</p>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4">
        <button
            :disabled="page === 1"
            @click="page--"
            class="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--gold)] disabled:opacity-30 transition text-white"
        >
          ◀
        </button>

        <span class="text-[var(--text-gray)]">
          Page {{ page }} / {{ totalPages }}
        </span>

        <button
            :disabled="page === totalPages"
            @click="page++"
            class="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--gold)] disabled:opacity-30 transition text-white"
        >
          ▶
        </button>
      </div>
    </div>

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