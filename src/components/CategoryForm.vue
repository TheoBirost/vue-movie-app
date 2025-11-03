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

watch(() => props.category, (newVal) => {
  name.value = newVal?.name || ""
  error.value = ""
})

const submit = async () => {
  if (!name.value.trim()) {
    error.value = "Le nom de la catégorie est requis."
    return
  }

  loading.value = true
  try {
    const payload = {
      "@context": "/api/contexts/Category",
      "name": name.value
    }

    if (props.category?.id) {
      await api.put(`/categories/${props.category.id}`, payload, {
        headers: { "Content-Type": "application/ld+json" }
      })
    } else {
      await api.post("/categories", payload, {
        headers: { "Content-Type": "application/ld+json" }
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
    <div class="bg-white/95 backdrop-blur-xl p-8 rounded-3xl w-full max-w-sm shadow-2xl">
      <h3 class="text-xl font-semibold mb-4 text-gray-900">
        {{ props.category?.id ? 'Modifier' : 'Ajouter' }} une catégorie
      </h3>

      <div class="flex flex-col gap-3">
        <input
            v-model="name"
            type="text"
            placeholder="Nom de la catégorie"
            class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button
            @click="submit"
            :disabled="loading"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-all duration-200 active:scale-95"
        >
          {{ loading ? "Enregistrement..." : props.category?.id ? "Modifier" : "Ajouter" }}
        </button>
        <button
            @click="emit('close')"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 rounded-xl transition-all duration-200 active:scale-95"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>
