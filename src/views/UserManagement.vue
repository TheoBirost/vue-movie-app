<script setup>
import { ref, onMounted } from "vue"
import api from "/src/api/api.js"
import UserRoleForm from "../components/UserRoleForm.vue"

const users = ref([])
const loading = ref(false)
const errorMessage = ref("")
const selectedUser = ref(null)
const showRoleForm = ref(false)

function formatDate(dateString) {
  if (!dateString) return "Non renseignée"
  const [year, month, day] = dateString.split("T")[0].split("-")
  return `${day}-${month}-${year}`
}

function formatRole(roles) {
  if (!roles || !Array.isArray(roles)) return "Aucun rôle"

  if (roles.includes("ROLE_ADMIN")) {
    return "Administrateur"
  }
  if (roles.includes("ROLE_USER")) {
    return "Utilisateur"
  }
  return roles[0] || "Aucun rôle"
}

async function fetchUsers() {
  loading.value = true
  errorMessage.value = ""

  try {
    const res = await api.get(`${import.meta.env.VITE_API_URL}/users`)
    users.value = Array.isArray(res.data.member) ? res.data.member : []
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status} : ${err.response.data.message || err.response.data['hydra:description'] || "Non spécifié"}`
    } else if (err.request) {
      errorMessage.value = "Impossible de récupérer les utilisateurs (aucune réponse du serveur)"
    } else {
      errorMessage.value = err.message
    }
  } finally {
    loading.value = false
  }
}

function openRoleForm(user) {
  selectedUser.value = user
  showRoleForm.value = true
}

function closeRoleForm() {
  showRoleForm.value = false
  selectedUser.value = null
}

async function handleRoleUpdated() {
  closeRoleForm()
  await fetchUsers()
}

onMounted(fetchUsers)
</script>

<template>
  <div class="min-h-screen text-gray-800">
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div v-if="loading" class="text-center py-20">
        <p class="text-gray-400 text-lg animate-pulse">Chargement...</p>
      </div>

      <div v-else-if="errorMessage" class="text-center py-20">
        <p class="text-red-500 text-lg font-medium">{{ errorMessage }}</p>
      </div>

      <div v-else>
        <h1 class="text-2xl font-semibold mb-6">Liste des utilisateurs</h1>

        <div v-if="users.length === 0" class="text-gray-500 text-center">
          Aucun utilisateur trouvé.
        </div>

        <table v-else class="min-w-full border border-gray-200 rounded-xl overflow-hidden">
          <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">ID</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">Prénom</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">Rôle</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">Date de naissance</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t border-gray-100 hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-700">{{ user.id }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ user.firstname }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ user.lastname }}</td>
            <td class="px-6 py-4 text-sm text-gray-700 break-all">{{ user.email }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">
              <span
                  :class="user.roles && user.roles.includes('ROLE_ADMIN') ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'"
                  class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ formatRole(user.roles) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700">
              {{ user.dob ? formatDate(user.dob) : "Non renseignée" }}
            </td>
            <td class="px-6 py-4 text-sm">
              <button
                  @click="openRoleForm(user)"
                  class="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
              >
                Modifier rôle
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>

    <UserRoleForm
        v-if="showRoleForm && selectedUser"
        :user="selectedUser"
        @updated="handleRoleUpdated"
        @cancel="closeRoleForm"
    />
  </div>
</template>