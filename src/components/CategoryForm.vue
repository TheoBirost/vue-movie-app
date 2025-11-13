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
  <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn"
      @click.self="emit('close')"
  >
    <div
        class="relative bg-[var(--color-gigas-950)]/95 backdrop-blur-2xl border border-[var(--color-gigas-700)]/50 rounded-3xl w-full max-w-md p-8 shadow-[0_0_40px_-10px_var(--color-gigas-700)] text-white animate-scaleUp"
    >
      <!-- Décor lumineux -->
      <div
          class="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--color-gigas-700)]/20 to-[var(--color-gigas-600)]/10"
      ></div>

      <div class="relative space-y-6 z-10">
        <h3 class="text-2xl font-bold text-[var(--color-gigas-300)] text-center">
          {{ props.category?.id ? "Modifier" : "Ajouter" }} une catégorie
        </h3>

        <div class="flex flex-col gap-4">
          <input
              v-model="name"
              type="text"
              placeholder="Nom de la catégorie"
              class="w-full px-5 py-4 bg-[var(--color-gigas-900)]/60 backdrop-blur-xl text-white border border-[var(--color-gigas-700)]/50 rounded-2xl focus:outline-none focus:border-[var(--color-gigas-500)] transition-all placeholder-[var(--color-gigas-500)]"
          />
          <p
              v-if="error"
              class="text-red-400 text-sm font-medium text-center animate-pulse"
          >
            {{ error }}
          </p>

          <button
              @click="submit"
              :disabled="loading"
              class="relative w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--color-gigas-600)] to-[var(--color-gigas-500)] font-semibold text-white shadow-lg shadow-[var(--color-gigas-600)]/50 hover:shadow-[var(--color-gigas-600)]/80 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span class="relative z-10">
              {{ loading ? "Enregistrement..." : props.category?.id ? "Modifier" : "Ajouter" }}
            </span>
            <div
                class="absolute inset-0 bg-gradient-to-r from-[var(--color-gigas-500)] to-[var(--color-gigas-400)] opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
          </button>

          <button
              @click="emit('close')"
              class="w-full py-4 bg-[var(--color-gigas-900)]/70 hover:bg-[var(--color-gigas-800)]/90 border border-[var(--color-gigas-700)]/40 rounded-2xl font-medium text-[var(--color-gigas-200)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-scaleUp {
  animation: scaleUp 0.35s ease-out;
}
</style>
