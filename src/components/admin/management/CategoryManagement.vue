<script setup>
import { ref, onMounted, computed } from "vue"
import CategoryForm from "../forms/CategoryForm.vue"
import ConfirmDeleteCategory from "../modals/ConfirmDeleteCategory.vue"
import api from '../../../api/api'

const loading = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const selectedCategory = ref(null)
const categoryToDelete = ref(null)
const errorMessage = ref("")
const categories = ref([])

// Pagination
const page = ref(1)
const totalItems = ref(0)
const itemsPerPage = 30

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const fetchCategories = async () => {
  loading.value = true
  errorMessage.value = ""
  try {
    const response = await api.get('/categories', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage
      }
    })
    const data = response.data
    categories.value = data['hydra:member'] || data['member'] || []
    totalItems.value = data['hydra:totalItems'] || data['totalItems'] || categories.value.length
  } catch (err) {
    errorMessage.value = "Error loading categories."
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
  if (!categoryToDelete.value) return;
  try {
    if (categoryToDelete.value.moviesCount > 0) {
      alert("This category cannot be deleted as it is linked to movies.")
      showConfirm.value = false
      return
    }
    await api.delete(`/categories/${categoryToDelete.value.id}`)
    showConfirm.value = false
    categoryToDelete.value = null
    fetchCategories()
  } catch {
    errorMessage.value = "An error occurred during deletion."
  }
}

const onFormSaved = async () => {
  showForm.value = false;
  await fetchCategories();
};

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
    fetchCategories()
  }
}

onMounted(async () => {
  await fetchCategories()
})
</script>

<template>
  <div class="universal-card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="garamond text-3xl font-bold text-white">Gestion des Catégories</h2>
      <div class="flex items-center gap-4">
        <span class="text-sm text-text-gray">Total: <span class="text-gold font-bold">{{ totalItems }}</span></span>
        <button
          @click="selectedCategory = null; showForm = true"
          class="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-widest uppercase"
        >
          + Ajouter
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="flex justify-center gap-2 mb-2">
          <div class="w-2 h-2 bg-gold rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-gold rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-gold rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
      <p class="text-text-gray text-sm">Chargement des catégories...</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="border-b border-border bg-bg-main/50">
          <tr>
            <th class="p-4 text-xs font-bold text-text-gray uppercase tracking-widest">Nom</th>
            <th class="p-4 text-xs font-bold text-text-gray uppercase tracking-widest">Films</th>
            <th class="p-4 text-xs font-bold text-text-gray uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id" class="border-b border-border hover:bg-white/5 transition-colors">
            <td class="p-4 text-white font-medium">{{ category.name }}</td>
            <td class="p-4 text-text-gray text-sm">{{ category.moviesCount || 0 }}</td>
            <td class="p-4 text-right">
              <button @click="editCategory(category)" class="text-gold hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-gold/30 hover:bg-gold/10 px-3 py-1.5 rounded mr-2">
                Modifier
              </button>
              <button @click="confirmDelete(category)" class="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-colors border border-red-900/50 hover:bg-red-900/20 px-3 py-1.5 rounded">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-border">
        <button
          @click="changePage(page - 1)"
          :disabled="page === 1"
          class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded text-white hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Précédent
        </button>
        <span class="text-text-gray text-sm">Page <span class="text-gold font-bold">{{ page }}</span> sur {{ totalPages }}</span>
        <button
          @click="changePage(page + 1)"
          :disabled="page === totalPages"
          class="px-4 py-2 bg-[#16181E] border border-[#2A2D36] rounded text-white hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Suivant
        </button>
      </div>
    </div>

    <CategoryForm v-if="showForm" :category="selectedCategory" @close="showForm = false" @refresh="onFormSaved" />
    <ConfirmDeleteCategory v-if="showConfirm" :category="categoryToDelete" @cancel="showConfirm = false" @confirm="deleteCategory" />
  </div>
</template>
