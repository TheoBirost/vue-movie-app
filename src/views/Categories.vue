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
  <div class="min-h-screen bg-color-bg text-color-text">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header class="flex flex-col md:flex-row justify-between items-center mb-12" data-aos="fade-down">
        <div class="text-center md:text-left mb-8 md:mb-0">
          <h1 class="text-5xl font-gloock font-bold text-color-heading mb-2">Movie Categories</h1>
          <p class="text-lg text-color-text">Organize and explore by genre.</p>
        </div>
        <button
          v-if="userRole === 'ROLE_ADMIN'"
          @click="selectedCategory = null; showForm = true"
          class="btn-primary"
        >
          + Add Category
        </button>
      </header>

      <div class="mb-12" data-aos="fade-down">
        <input
          v-model="search"
          type="text"
          placeholder="Search for a category..."
          class="w-full px-5 py-3 bg-color-surface border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary transition-all"
        />
      </div>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="w-16 h-16 border-4 border-color-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="errorMessage" class="text-center py-16 text-red-500" data-aos="fade-up">
        <p>{{ errorMessage }}</p>
      </div>

      <div v-else-if="categories.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div v-for="category in categories" :key="category.id" data-aos="fade-up">
            <div class="bg-color-surface p-6 rounded-lg shadow-lg border border-color-border hover:shadow-xl hover:border-color-primary transition-all">
              <h3 class="text-xl font-bold text-color-heading mb-2">{{ category.name }}</h3>
              <p class="text-sm text-color-text mb-4">{{ category.moviesCount || 0 }} movies</p>
              <div v-if="userRole === 'ROLE_ADMIN'" class="flex gap-2 mt-4">
                <button @click.stop="editCategory(category)" class="w-full py-2 px-4 btn-secondary">Edit</button>
                <button @click.stop="confirmDelete(category)" class="w-full py-2 px-4 btn-danger">Delete</button>
              </div>
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
        <p class="text-color-text text-lg">No categories found. Try a different search.</p>
      </div>
    </div>

    <CategoryForm v-if="showForm" :category="selectedCategory" @close="showForm = false" @refresh="fetchCategories" />
    <ConfirmDeleteCategory v-if="showConfirm" :category="categoryToDelete" @cancel="showConfirm = false" @confirm="deleteCategory" />
  </div>
</template>
