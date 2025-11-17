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
    error.value = "Le nom de la catégorie est requis."
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
    error.value = err.response?.data?.detail || "Une erreur est survenue."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50" @click.self="emit('close')">
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] w-full max-w-md p-8 shadow-2xl mx-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">
          {{ props.category?.id ? "Modifier" : "Ajouter" }} une catégorie
        </h2>
        <button @click="emit('close')" class="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition text-[var(--text-gray)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[var(--text-gray)] mb-2">Nom de la catégorie</label>
          <input v-model="name" type="text" placeholder="Ex: Action, Comédie..."
                 class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition" />
        </div>

        <div v-if="error" class="bg-red-900/20 border border-red-800/30 text-red-400 p-3 rounded-lg text-sm">
          {{ error }}
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--border)]">
        <button @click="emit('close')"
                class="px-5 py-3 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-gray)] rounded-lg transition font-medium">
          Annuler
        </button>
        <button @click="submit" :disabled="loading"
                class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? "Enregistrement..." : props.category?.id ? "Modifier" : "Ajouter" }}
        </button>
      </div>
    </div>
  </div>
</template>