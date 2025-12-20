<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue"
import { gsap } from 'gsap'
import { useDataStore } from '../../stores/useDataStore'

const dataStore = useDataStore()
const search = ref("")
const page = ref(1)
const loading = ref(true)
const errorMessage = ref("")

const limit = 12

const filteredCategories = computed(() => {
  if (!search.value) {
    return dataStore.categories;
  }
  return dataStore.categories.filter(category =>
    category.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredCategories.value.length / limit));
});

const paginatedCategories = computed(() => {
  const start = (page.value - 1) * limit;
  const end = start + limit;
  return filteredCategories.value.slice(start, end);
});

const fetchCategories = async (force = false) => {
  loading.value = true
  errorMessage.value = ""
  try {
    await dataStore.fetchCategories(force)
    await nextTick()
    animateCards()
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

const animateCards = () => {
  if (document.querySelectorAll('.category-card-wrapper').length > 0) {
    gsap.from('.category-card-wrapper', {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    })
  }
}

watch(search, () => {
  page.value = 1;
});

watch(page, () => {
  nextTick().then(() => {
    animateCards();
  });
});

onMounted(async () => {
  await fetchCategories()

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
          <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">GENRES</div>
          <h1 class="garamond text-6xl md:text-7xl font-bold text-white mb-3">Catégories</h1>
          <div class="h-1 w-24 bg-gradient-to-r from-[#FFD700] to-transparent" />
        </div>
      </div>

      <!-- Barre de recherche -->
      <div class="search-bar">
        <div class="relative">
          <label for="category-search" class="sr-only">Rechercher une catégorie</label>
          <input
              id="category-search"
              v-model="search"
              placeholder="Rechercher une catégorie..."
              class="w-full px-6 py-4 bg-[#16181E] text-white border border-[#2A2D36] rounded-lg focus:outline-none focus:border-[#FFD700] transition-all text-lg"
          />
          <svg class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center min-h-[40vh]" aria-label="Chargement en cours">
        <div class="flex gap-2">
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <!-- Grille de catégories -->
      <div v-else-if="paginatedCategories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="category in paginatedCategories" :key="category.id" class="category-card-wrapper bg-[#16181E] border border-[#2A2D36] rounded-lg p-6 space-y-4 transition-all hover:border-[#FFD700]">
          <div>
            <h3 class="text-xl font-bold text-white">{{ category.name }}</h3>
            <p class="text-sm text-[#82828A]">{{ category.moviesCount || 0 }} films</p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <div class="inline-block p-6 bg-[#16181E] rounded-full mb-6">
          <svg class="w-12 h-12 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
          </svg>
        </div>
        <p class="text-[#C1C1C7] text-lg">{{ errorMessage || "Aucune catégorie trouvée" }}</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-6 pt-8">
        <button
            :disabled="page === 1"
            @click="page--"
            class="w-12 h-12 rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center"
            aria-label="Page précédente"
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
            aria-label="Page suivante"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
