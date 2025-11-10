<script setup>
import { ref, watch } from "vue"
import api from "/src/api/api.js"

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['updated', 'cancel'])

const selectedRole = ref(props.user.roles && props.user.roles.length > 0 ? props.user.roles[0] : 'ROLE_USER')
const loading = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const availableRoles = [
  { value: 'ROLE_USER', label: 'Utilisateur' },
  { value: 'ROLE_ADMIN', label: 'Administrateur' }
]

watch(() => props.user, (newUser) => {
  selectedRole.value = newUser.roles && newUser.roles.length > 0 ? newUser.roles[0] : 'ROLE_USER'
  errorMessage.value = ""
  successMessage.value = ""
}, { immediate: true })

async function updateRole() {
  const currentRole = props.user.roles && props.user.roles.length > 0 ? props.user.roles[0] : 'ROLE_USER'

  if (selectedRole.value === currentRole) {
    errorMessage.value = "Le rôle n'a pas changé"
    return
  }

  loading.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    const url = `users/${props.user.id}/role`
    console.log('URL complète:', url)
    console.log('Nouveau rôle:', selectedRole.value)

    await api.put(url, {
      role: selectedRole.value
    })

    successMessage.value = "Rôle modifié avec succès"

    setTimeout(() => {
      emit('updated')
    }, 1000)
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status} : ${err.response.data.message || err.response.data['hydra:description'] || "Non spécifié"}`
    } else if (err.request) {
      errorMessage.value = "Impossible de modifier le rôle (aucune réponse du serveur)"
    } else {
      errorMessage.value = err.message
    }
  } finally {
    loading.value = false
  }
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">
        Modifier le rôle de {{ user.firstname }} {{ user.lastname }}
      </h2>

      <div class="mb-4 p-3 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-600">Email : <span class="font-medium">{{ user.email }}</span></p>
        <p class="text-sm text-gray-600 mt-1">Rôle actuel :
          <span class="font-medium">
            {{ user.roles && user.roles[0] === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur' }}
          </span>
        </p>
      </div>

      <div class="mb-6">
        <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
          Nouveau rôle
        </label>
        <select
            id="role"
            v-model="selectedRole"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="loading"
        >
          <option v-for="role in availableRoles" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>
      </div>

      <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">{{ errorMessage }}</p>
      </div>

      <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-600">{{ successMessage }}</p>
      </div>

      <div class="flex gap-3 justify-end">
        <button
            @click="cancel"
            :disabled="loading"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
            @click="updateRole"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ loading ? 'Modification...' : 'Confirmer' }}
        </button>
      </div>
    </div>
  </div>
</template>