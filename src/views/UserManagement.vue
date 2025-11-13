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
  if (!dateString) return "—"
  const [year, month, day] = dateString.split("T")[0].split("-")
  return `${day}-${month}-${year}`
}

function formatRole(roles) {
  if (!roles || !Array.isArray(roles)) return "Aucun rôle"
  if (roles.includes("ROLE_ADMIN")) return "Admin"
  if (roles.includes("ROLE_USER")) return "User"
  return roles[0] || "—"
}

async function fetchUsers() {
  loading.value = true
  errorMessage.value = ""
  try {
    const res = await api.get(`${import.meta.env.VITE_API_URL}/users`)
    users.value = Array.isArray(res.data.member) ? res.data.member : []
  } catch (err) {
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status}`
    } else if (err.request) {
      errorMessage.value = "Impossible de récupérer les utilisateurs"
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
  <div class="min-h-screen bg-[var(--bg-main)]">
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div v-if="loading" class="text-center py-20">
        <p class="text-[var(--text-gray)] animate-pulse">Chargement...</p>
      </div>

      <div v-else-if="errorMessage" class="text-center py-20">
        <p class="text-red-400">{{ errorMessage }}</p>
      </div>

      <div v-else class="space-y-6">
        <h1 class="text-4xl font-bold text-white">Gestion des utilisateurs</h1>

        <div v-if="users.length === 0" class="text-center text-[var(--text-gray)]">
          Aucun utilisateur
        </div>

        <div v-else class="bg-[var(--bg-card)] rounded-[var(--radius)] border border-[var(--border)] overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--bg-hover)]">
            <tr>
              <th class="px-4 py-3 text-left text-sm text-[var(--text-gray)]">ID</th>
              <th class="px-4 py-3 text-left text-sm text-[var(--text-gray)]">Prénom</th>
              <th class="px-4 py-3 text-left text-sm text-[var(--text-gray)]">Nom</th>
              <th class="px-4 py-3 text-left text-sm text-[var(--text-gray)]">Email</th>
              <th class="px-4 py-3 text-left text-sm text-[var(--text-gray)]">Rôle</th>
              <th class="px-4 py-3 text-left text-sm text-[var(--text-gray)]">Naissance</th>
              <th class="px-4 py-3 text-left text-sm text-[var(--text-gray)]">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="user in users" :key="user.id" class="border-t border-[var(--border)] hover:bg-[var(--bg-hover)]">
              <td class="px-4 py-3 text-sm text-white">{{ user.id }}</td>
              <td class="px-4 py-3 text-sm text-white">{{ user.firstname }}</td>
              <td class="px-4 py-3 text-sm text-white">{{ user.lastname }}</td>
              <td class="px-4 py-3 text-sm text-white break-all">{{ user.email }}</td>
              <td class="px-4 py-3 text-sm">
                  <span
                      :class="user.roles && user.roles.includes('ROLE_ADMIN') ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'"
                      class="px-2 py-1 rounded text-xs"
                  >
                    {{ formatRole(user.roles) }}
                  </span>
              </td>
              <td class="px-4 py-3 text-sm text-white">{{ user.dob ? formatDate(user.dob) : "—" }}</td>
              <td class="px-4 py-3 text-sm">
                <button
                    @click="openRoleForm(user)"
                    class="px-3 py-1.5 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black text-xs rounded transition"
                >
                  Modifier
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <UserRoleForm
        v-if="showRoleForm && selectedUser"
        :user="selectedUser"
        @updated="handleRoleUpdated"
        @cancel="closeRoleForm"
    />
  </div>
</template>