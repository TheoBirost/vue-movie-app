<script setup>
import { ref, watch } from "vue"
import api from "/src/api/api.js"

const props = defineProps({
  user: { type: Object, required: true }
})
const emit = defineEmits(['updated', 'cancel'])

const selectedRole = ref(props.user.roles?.[0] || 'ROLE_USER')
const loading = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const availableRoles = [
  { value: 'ROLE_USER', label: 'Utilisateur' },
  { value: 'ROLE_ADMIN', label: 'Administrateur' }
]

watch(() => props.user, (newUser) => {
  selectedRole.value = newUser.roles?.[0] || 'ROLE_USER'
  errorMessage.value = ""
  successMessage.value = ""
}, { immediate: true })

async function updateRole() {
  const currentRole = props.user.roles?.[0] || 'ROLE_USER'
  if (selectedRole.value === currentRole) {
    errorMessage.value = "Le rôle n'a pas changé"
    return
  }
  loading.value = true
  errorMessage.value = ""
  successMessage.value = ""
  try {
    await api.put(`users/${props.user.id}/role`, { role: selectedRole.value })
    successMessage.value = "Rôle modifié avec succès"
    setTimeout(() => emit('updated'), 1000)
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status} : ${err.response.data.message || err.response.data['hydra:description'] || "Non spécifié"}`
    } else if (err.request) {
      errorMessage.value = "Impossible de modifier le rôle (aucune réponse du serveur)"
    } else {
      errorMessage.value = err.message
    }
  } finally { loading.value = false }
}

function cancel() { emit('cancel') }
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="relative w-full max-w-md mx-4 p-6 rounded-xl shadow-2xl bg-[var(--color-gigas-950)] border border-[var(--color-gigas-700)] text-[var(--color-gigas-100)] overflow-hidden animate-fadeIn">
      <div class="absolute inset-0 bg-gradient-to-br from-[var(--color-gigas-900)]/80 to-[var(--color-gigas-800)]/80"></div>
      <div class="relative z-10 flex flex-col gap-4">
        <h2 class="text-xl font-semibold">{{ `Modifier le rôle de ${user.firstname} ${user.lastname}` }}</h2>
        <div class="p-3 rounded-lg bg-[var(--color-gigas-900)]">
          <p class="text-sm text-[var(--color-gigas-200)]">Email : <span class="font-medium">{{ user.email }}</span></p>
          <p class="text-sm text-[var(--color-gigas-200)] mt-1">
            Rôle actuel : <span class="font-medium">{{ user.roles?.[0] === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur' }}</span>
          </p>
        </div>
        <div>
          <label for="role" class="block text-sm font-medium mb-2">Nouveau rôle</label>
          <select
              id="role"
              v-model="selectedRole"
              class="w-full px-4 py-2 border border-[var(--color-gigas-700)] rounded-lg focus:ring-2 focus:ring-[var(--color-gigas-500)] focus:border-transparent bg-[var(--color-gigas-900)] text-[var(--color-gigas-100)]"
              :disabled="loading"
          >
            <option v-for="role in availableRoles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>
        <div v-if="errorMessage" class="p-3 rounded-lg bg-red-700/30 border border-red-600 text-red-200 text-sm">{{ errorMessage }}</div>
        <div v-if="successMessage" class="p-3 rounded-lg bg-green-700/30 border border-green-600 text-green-200 text-sm">{{ successMessage }}</div>
        <div class="flex gap-3 justify-end mt-2">
          <button
              @click="cancel"
              :disabled="loading"
              class="px-4 py-2 rounded-lg bg-[var(--color-gigas-800)] hover:bg-[var(--color-gigas-700)] text-[var(--color-gigas-200)] disabled:opacity-50"
          >
            Annuler
          </button>
          <button
              @click="updateRole"
              :disabled="loading"
              class="px-4 py-2 rounded-lg bg-[var(--color-gigas-500)] hover:bg-[var(--color-gigas-400)] text-white flex items-center gap-2 disabled:opacity-50"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ loading ? 'Modification...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
