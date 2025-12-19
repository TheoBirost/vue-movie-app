<script setup>
import { ref, onMounted, computed } from "vue"
import { useDataStore } from '../../../stores/useDataStore'
import CategoryForm from "../forms/CategoryForm.vue"
import ConfirmDeleteCategory from "../modals/ConfirmDeleteCategory.vue"
import api from '../../../api/api'

const dataStore = useDataStore()

const loading = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const selectedCategory = ref(null)
const categoryToDelete = ref(null)
const errorMessage = ref("")

const categories = computed(() => dataStore.categories)

const fetchCategories = async (force = false) => {
  loading.value = true
  errorMessage.value = ""
  try {
    await dataStore.fetchCategories(force)
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
    dataStore.removeCategoryById(categoryToDelete.value.id);
    showConfirm.value = false
    categoryToDelete.value = null
  } catch {
    errorMessage.value = "An error occurred during deletion."
  }
}

const onFormSaved = async () => {
  showForm.value = false;
  await fetchCategories(true);
};

onMounted(async () => {
  await fetchCategories()
})
</script>

<template>
  <div class="universal-card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="garamond text-3xl font-bold text-white">Manage Categories</h2>
      <button
        @click="selectedCategory = null; showForm = true"
        class="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-widest uppercase"
      >
        + Add Category
      </button>
    </div>
    <div v-if="loading" class="text-center py-10">
      <p class="text-text-gray">Loading categories...</p>
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
          <tr v-for="category in categories" :key="category.id" class="border-b border-border hover:bg-bg-hover">
            <td class="p-4 text-text-white">{{ category.name }}</td>
            <td class="p-4 text-right">
              <button @click="editCategory(category)" class="text-gold hover:text-gold-light font-semibold transition-colors mr-4">Edit</button>
              <button @click="confirmDelete(category)" class="text-red-500 hover:text-red-400 font-semibold transition-colors">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <CategoryForm v-if="showForm" :category="selectedCategory" @close="showForm = false" @refresh="onFormSaved" />
    <ConfirmDeleteCategory v-if="showConfirm" :category="categoryToDelete" @cancel="showConfirm = false" @confirm="deleteCategory" />
  </div>
</template>
