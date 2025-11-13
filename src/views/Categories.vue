<script setup>
import { ref, onMounted, watch } from "vue"
import api from "/src/api/api.js"
import CategoryForm from "/src/components/CategoryForm.vue"
import ConfirmDeleteCategory from "/src/components/ConfirmDeleteCategory.vue"

const categories = ref([])
const search = ref("")
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const errorMessage = ref("")
const showForm = ref(false)
const showConfirm = ref(false)
const selectedCategory = ref(null)
const categoryToDelete = ref(null)
const userRole = ref('')

const limit = 12

const fetchCategories = async () => {
  loading.value = true
  errorMessage.value = ""
  try {
    const res = await api.get("/categories", {
      params: {
        page: page.value,
        itemsPerPage: limit,
        "order[id]": "desc",
        name: search.value || undefined,
      },
    })
    categories.value = res.data.member || []
    const totalItems = res.data.totalItems || 0
    totalPages.value = Math.max(1, Math.ceil(totalItems / limit))
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status}`
    } else if (err.request) {
      errorMessage.value = "Aucune catégorie trouvée"
    } else {
      errorMessage.value = err.message
    }
  } finally {
    loading.value = false
  }
}

const editCategory = (category) => {
  selectedCategory.value = { ...category }
  showForm.value = true
}

const confirmDelete = (category) => {
  categoryToDelete.value = category
  showConfirm.value = true
}

const deleteCategory = async () => {
  try {
    if (categoryToDelete.value.moviesCount > 0) {
      alert("Impossible de supprimer cette catégorie car elle contient des films.")
      showConfirm.value = false
      return
    }
    await api.delete(`/categories/${categoryToDelete.value.id}`)
    showConfirm.value = false
    categoryToDelete.value = null
    await fetchCategories()
  } catch {
    errorMessage.value = "Erreur lors de la suppression"
  }
}

watch(page, fetchCategories)

let searchTimeout = null
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchCategories()
  }, 300)
})

onMounted(async () => {
  await fetchCategories()
  try {
    const res = await api.get(import.meta.env.VITE_API_URL_USER)
    userRole.value = res.data.roles[0] || 'aucun rôle'
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
          <h1 class="text-5xl font-bold text-white mb-2">Catégories</h1>
          <p class="text-[var(--text-gray)]">Organisez vos films</p>
        </div>

        <button
            v-if="userRole === 'ROLE_ADMIN'"
            @click="selectedCategory = null; showForm = true"
            class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black font-semibold rounded-lg transition"
        >
          + Ajouter
        </button>
      </div>

      <input
          v-model="search"
          placeholder="Rechercher une catégorie..."
          class="w-full px-4 py-3 bg-[var(--bg-card)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition"
      />

      <div v-if="loading" class="text-center py-20">
        <div class="flex gap-2 justify-center">
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-[var(--gold)] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <div v-else-if="categories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="category in categories" :key="category.id">
          <div class="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] hover:border-[var(--gold)] transition">
            <h3 class="text-xl font-semibold text-white mb-2">
              {{ category.name }}
            </h3>
            <p class="text-[var(--text-gray)] text-sm mb-4">
              {{ category.moviesCount || 0 }} films
            </p>

            <div v-if="userRole === 'ROLE_ADMIN'" class="flex gap-2">
              <button
                  @click.stop="editCategory(category)"
                  class="flex-1 px-3 py-2 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-gray)] text-sm rounded-lg transition"
              >
                Modifier
              </button>
              <button
                  @click.stop="confirmDelete(category)"
                  class="flex-1 px-3 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 text-sm rounded-lg transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-[var(--text-gray)] text-lg">{{ errorMessage || "Aucune catégorie trouvée" }}</p>
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

    <CategoryForm
        v-if="showForm"
        :category="selectedCategory"
        @close="showForm = false"
        @refresh="fetchCategories"
    />

    <ConfirmDeleteCategory
        v-if="showConfirm"
        :category="categoryToDelete"
        @cancel="showConfirm = false"
        @confirm="deleteCategory"
    />
  </div>
</template>