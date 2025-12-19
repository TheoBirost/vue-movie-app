<script setup>
import { ref, watch, onMounted } from "vue"
import { gsap } from 'gsap'
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

onMounted(() => {
  gsap.from('.form-container', {
    opacity: 0,
    y: 50,
    duration: 0.5,
    ease: 'power3.out'
  })
})

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
    successMessage.value = "Rôle mis à jour avec succès"
    setTimeout(() => emit('updated'), 1000)
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status} : ${err.response.data.message || err.response.data['hydra:description'] || "Non spécifié"}`
    } else if (err.request) {
      errorMessage.value = "Impossible de mettre à jour le rôle (pas de réponse du serveur)"
    } else {
      errorMessage.value = err.message
    }
  } finally { loading.value = false }
}

function cancel() { emit('cancel') }
</script>

<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="cancel">
    <div class="form-container bg-[#16181E] border border-[#2A2D36] rounded-lg w-full max-w-md shadow-2xl">
      <header class="p-6 border-b border-[#2A2D36]">
        <h2 class="garamond text-2xl font-bold text-white">
          Modifier le rôle de {{ user.firstname }} {{ user.lastname }}
        </h2>
      </header>

      <main class="p-6 space-y-4">
        <div class="p-4 bg-[#0d0d0f] border border-[#2A2D36] rounded-lg">
          <p class="text-sm text-[#82828A]">Email: <span class="font-medium text-white">{{ user.email }}</span></p>
          <p class="text-sm text-[#82828A] mt-2">
            Rôle actuel: <span class="font-medium text-white">{{ user.roles?.[0] === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur' }}</span>
          </p>
        </div>

        <div>
          <label for="role-select" class="block text-sm font-medium text-[#C1C1C7] mb-1">Nouveau rôle</label>
          <select id="role-select" v-model="selectedRole" :disabled="loading" class="w-full px-4 py-2 bg-[#0d0d0f] border border-[#2A2D36] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]">
            <option v-for="role in availableRoles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>

        <div v-if="errorMessage" class="bg-red-900/20 border border-red-800/30 text-red-400 p-3 rounded-md text-sm">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="bg-green-900/20 border border-green-800/30 text-green-400 p-3 rounded-md text-sm">
          {{ successMessage }}
        </div>
      </main>

      <footer class="p-6 flex justify-end gap-4 border-t border-[#2A2D36]">
        <button @click="cancel" :disabled="loading" class="px-6 py-2.5 rounded-lg text-sm font-bold text-[#C1C1C7] border border-[#2A2D36] hover:bg-white/10 transition-colors disabled:opacity-50">
          Annuler
        </button>
        <button @click="updateRole" :disabled="loading" class="px-6 py-2.5 rounded-lg text-sm font-bold text-black bg-[#FFD700] hover:bg-[#FFE55C] transition-all disabled:opacity-50 flex items-center gap-2">
          <svg v-if="loading" class="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ loading ? 'Mise à jour...' : 'Confirmer' }}
        </button>
      </footer>
    </div>
  </div>
</template>
