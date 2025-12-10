<script setup>
import { ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { gsap } from 'gsap'
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

    // Animation GSAP
    gsap.from('.actor-card-wrapper', {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    })
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

  // Animations initiales
  gsap.from('.page-title', {
    opacity: 0,
    y: -50,
    duration: 0.8,
    ease: 'power3.out'
  })

  gsap.from('.search-bar', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.2,
    ease: 'power3.out'
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0f]">
    <div class="max-w-7xl mx-auto px-6 py-20 space-y-12">

      <!-- Header -->
      <div class="flex justify-between items-end">
        <div class="page-title">
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">TALENTS</div>
          <h1 class="garamond text-6xl md:text-7xl font-bold text-white mb-3">Acteurs</h1>
          <div class="h-1 w-24 bg-gradient-to-r from-[#FFD700] to-transparent" />
        </div>

        <button
            v-if="userRole === 'ROLE_ADMIN'"
            @click="selectedActor = null; showForm = true"
            class="px-8 py-4 bg-[#FFD700] hover:bg-[#FFE55C] text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-[0.2em]"
        >
          + AJOUTER UN ACTEUR
        </button>
      </div>

      <!-- Barre de recherche -->
      <div class="search-bar">
        <div class="relative">
          <input
              v-model="search"
              placeholder="Rechercher un acteur..."
              class="w-full px-6 py-4 bg-[#16181E] text-white border border-[#2A2D36] rounded-lg focus:outline-none focus:border-[#FFD700] transition-all text-lg"
          />
          <svg class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center min-h-[40vh]">
        <div class="flex gap-2">
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <!-- Grille d'acteurs -->
      <div v-else-if="actors.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="actor in actors" :key="actor.id" class="actor-card-wrapper">
          <div @click="goToActor(actor.id)">
            <ActorCard :actor="actor" />
          </div>

          <div v-if="userRole === 'ROLE_ADMIN'" class="flex gap-2 mt-4">
            <button
                @click.stop="editActor(actor)"
                class="flex-1 px-4 py-2.5 bg-[#1E2129] hover:bg-[#2A2D36] border border-[#2A2D36] text-[#C1C1C7] hover:text-white text-xs rounded-lg transition-all font-medium tracking-wide"
            >
              MODIFIER
            </button>
            <button
                @click.stop="confirmDelete(actor)"
                class="flex-1 px-4 py-2.5 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 text-xs rounded-lg transition-all font-medium tracking-wide"
            >
              SUPPRIMER
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <div class="inline-block p-6 bg-[#16181E] rounded-full mb-6">
          <svg class="w-12 h-12 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <p class="text-[#C1C1C7] text-lg">{{ errorMessage || "Aucun acteur trouvé" }}</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-6 pt-8">
        <button
            :disabled="page === 1"
            @click="page--"
            class="w-12 h-12 rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <span class="text-[#C1C1C7] tracking-[0.2em] text-sm">
          PAGE <span class="text-[#FFD700] font-bold">{{ page }}</span> / {{ totalPages }}
        </span>

        <button
            :disabled="page === totalPages"
            @click="page++"
            class="w-12 h-12 rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
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