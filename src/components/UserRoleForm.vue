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
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50" @click.self="cancel">
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] w-full max-w-md p-8 shadow-2xl mx-4">
      <h2 class="text-2xl font-bold text-white mb-6">
        Modifier le rôle de {{ user.firstname }} {{ user.lastname }}
      </h2>

      <div class="space-y-4">
        <div class="p-4 bg-[var(--bg-main)] border border-[var(--border)] rounded-lg">
          <p class="text-sm text-[var(--text-gray)]">Email : <span class="text-white font-medium">{{ user.email }}</span></p>
          <p class="text-sm text-[var(--text-gray)] mt-2">
            Rôle actuel : <span class="text-white font-medium">{{ user.roles?.[0] === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur' }}</span>
          </p>
        </div>

        <div>
          <label for="role" class="block text-sm font-medium text-[var(--text-gray)] mb-2">Nouveau rôle</label>
          <select
              id="role"
              v-model="selectedRole"
              class="w-full px-4 py-3 bg-[var(--bg-main)] text-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] transition"
              :disabled="loading"
          >
            <option v-for="role in availableRoles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>

        <div v-if="errorMessage" class="bg-red-900/20 border border-red-800/30 text-red-400 p-3 rounded-lg text-sm">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="bg-green-900/20 border border-green-800/30 text-green-400 p-3 rounded-lg text-sm">
          {{ successMessage }}
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--border)]">
        <button
            @click="cancel"
            :disabled="loading"
            class="px-5 py-3 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-gray)] rounded-lg transition font-medium disabled:opacity-50"
        >
          Annuler
        </button>
        <button
            @click="updateRole"
            :disabled="loading"
            class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
          {{ loading ? 'Modification...' : 'Confirmer' }}
        </button>
      </div>
    </div>
  </div>
</template>