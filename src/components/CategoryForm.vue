<script setup>
import { ref, watch } from "vue"
import api from "/src/api/api.js"

const props = defineProps({
  category: Object
})
const emit = defineEmits(["close", "refresh"])

const name = ref(props.category?.name || "")
const loading = ref(false)
const error = ref("")

watch(
    () => props.category,
    (newVal) => {
      name.value = newVal?.name || ""
      error.value = ""
    }
)

const submit = async () => {
  if (!name.value.trim()) {
    error.value = "Category name is required."
    return
  }

  loading.value = true
  try {
    const payload = {
      "@context": "/api/contexts/Category",
      name: name.value,
    }

    if (props.category?.id) {
      await api.put(`/categories/${props.category.id}`, payload, {
        headers: { "Content-Type": "application/ld+json" },
      })
    } else {
      await api.post("/categories", payload, {
        headers: { "Content-Type": "application/ld+json" },
      })
    }

    emit("refresh")
    emit("close")
  } catch (err) {
    console.error("Erreur sauvegarde :", err.response?.data || err)
    error.value = err.response?.data?.detail || "An error occurred."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="emit('close')">
    <div class="bg-color-surface border border-color-border rounded-lg w-full max-w-md shadow-2xl" data-aos="fade-up">
      <header class="p-6 flex items-center justify-between border-b border-color-border">
        <h2 class="text-2xl font-gloock font-bold text-color-heading">
          {{ props.category?.id ? "Edit" : "Add" }} Category
        </h2>
        <button @click="emit('close')" class="p-2 rounded-full hover:bg-color-bg dark:hover:bg-color-surface text-color-text" aria-label="Close form">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </header>

      <main class="p-6 space-y-4">
        <div>
          <label for="category-name" class="block text-sm font-medium text-color-text mb-1">Category Name</label>
          <input id="category-name" v-model="name" type="text" placeholder="e.g., Action, Comedy..." class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary" />
        </div>

        <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-sm">
          {{ error }}
        </div>
      </main>

      <footer class="p-6 flex justify-end gap-4 border-t border-color-border">
        <button @click="emit('close')" class="btn-secondary">
          Cancel
        </button>
        <button @click="submit" :disabled="loading" class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? "Saving..." : props.category?.id ? "Save Changes" : "Add Category" }}
        </button>
      </footer>
    </div>
  </div>
</template>
