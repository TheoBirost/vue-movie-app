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
  { value: 'ROLE_USER', label: 'User' },
  { value: 'ROLE_ADMIN', label: 'Administrator' }
]

watch(() => props.user, (newUser) => {
  selectedRole.value = newUser.roles?.[0] || 'ROLE_USER'
  errorMessage.value = ""
  successMessage.value = ""
}, { immediate: true })

async function updateRole() {
  const currentRole = props.user.roles?.[0] || 'ROLE_USER'
  if (selectedRole.value === currentRole) {
    errorMessage.value = "The role has not changed"
    return
  }
  loading.value = true
  errorMessage.value = ""
  successMessage.value = ""
  try {
    await api.put(`users/${props.user.id}/role`, { role: selectedRole.value })
    successMessage.value = "Role updated successfully"
    setTimeout(() => emit('updated'), 1000)
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Error ${err.response.status} : ${err.response.data.message || err.response.data['hydra:description'] || "Not specified"}`
    } else if (err.request) {
      errorMessage.value = "Could not update role (no server response)"
    } else {
      errorMessage.value = err.message
    }
  } finally { loading.value = false }
}

function cancel() { emit('cancel') }
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="cancel">
    <div class="bg-color-surface border border-color-border rounded-lg w-full max-w-md shadow-2xl" data-aos="fade-up">
      <header class="p-6 border-b border-color-border">
        <h2 class="text-2xl font-gloock font-bold text-color-heading">
          Edit Role for {{ user.firstname }} {{ user.lastname }}
        </h2>
      </header>

      <main class="p-6 space-y-4">
        <div class="p-4 bg-color-bg border border-color-border rounded-lg">
          <p class="text-sm text-color-text">Email: <span class="font-medium text-color-heading">{{ user.email }}</span></p>
          <p class="text-sm text-color-text mt-2">
            Current Role: <span class="font-medium text-color-heading">{{ user.roles?.[0] === 'ROLE_ADMIN' ? 'Administrator' : 'User' }}</span>
          </p>
        </div>

        <div>
          <label for="role-select" class="block text-sm font-medium text-color-text mb-1">New Role</label>
          <select id="role-select" v-model="selectedRole" :disabled="loading" class="w-full px-4 py-2 bg-color-bg border border-color-border rounded-md focus:outline-none focus:ring-2 focus:ring-color-primary">
            <option v-for="role in availableRoles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>

        <div v-if="errorMessage" class="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-sm">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-md text-sm">
          {{ successMessage }}
        </div>
      </main>

      <footer class="p-6 flex justify-end gap-4 border-t border-color-border">
        <button @click="cancel" :disabled="loading" class="btn-secondary disabled:opacity-50">
          Cancel
        </button>
        <button @click="updateRole" :disabled="loading" class="btn-primary disabled:opacity-50 flex items-center gap-2">
          <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ loading ? 'Updating...' : 'Confirm' }}
        </button>
      </footer>
    </div>
  </div>
</template>
