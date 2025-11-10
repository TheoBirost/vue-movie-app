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

const limit = 12

const fetchCategories = async () => {
  loading.value = true
  errorMessage.value = ""
  try {
    const res = await api.get("/categories", {
      params: {
        page: page.value,
        itemsPerPage: limit,
        orderId: "desc",
        name: search.value || undefined,
      },
    })

    categories.value = res.data.member || []
    const totalItems = res.data.totalItems || 0
    totalPages.value = Math.max(1, Math.ceil(totalItems / limit))
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status} : ${err.response.data.message || "Non spécifié"}`
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
  }, 150)
})

onMounted(fetchCategories)

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
      <div class="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h1 class="text-5xl font-semibold text-gray-900 tracking-tight">
          Rechercher une catégorie de film
        </h1>
        <button
            @click="selectedCategory = null; showForm = true"
            v-if="userRole === 'ROLE_ADMIN'"
            class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-1"
        >
          <span class="font-bold text-2xl"> + </span>
          Ajouter une catégorie
        </button>
      </div>

      <div class="relative mb-8">
        <input
            v-model="search"
            placeholder="Rechercher une catégorie..."
            id="search"
            class="w-full px-6 py-4 bg-gray-100 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
        />
        <span class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               class="lucide lucide-search">
            <path d="m21 21-4.34-4.34"/>
            <circle cx="11" cy="11" r="8"/>
          </svg>
        </span>
      </div>

      <div v-if="loading" class="text-center py-20">
        <p class="text-gray-400 text-lg animate-pulse">Chargement...</p>
      </div>

      <div v-else-if="categories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div
            v-for="category in categories"
            :key="category.id"
            class="group p-4 border rounded-2xl bg-white"
        >
          <h3 class="font-semibold text-gray-900 text-lg mb-2">{{ category.name }}</h3>
          <p class="text-gray-500 text-sm mb-4">Films associés : {{ category.moviesCount || 0 }}</p>
          <div class="flex gap-2" v-if="userRole === 'ROLE_ADMIN'">
            <button
                @click.stop="editCategory(category)"
                class="justify-center flex gap-1 flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 text-sm"
            >
              Modifier
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
                @click.stop="confirmDelete(category)"
                class="justify-center flex gap-1 flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 text-sm"
            >
              Supprimer
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-gray-400 text-lg">
          {{ errorMessage || "Aucune catégorie trouvée" }}
        </p>
        <router-link
            v-if="errorMessage"
            to="/"
            class="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 items-center gap-1"
        >
          <span>Se reconnecter</span>
        </router-link>
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