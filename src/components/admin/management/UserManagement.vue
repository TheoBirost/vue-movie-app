<script setup>
import { ref, onMounted } from "vue"
import { gsap } from 'gsap'
import api from "/src/api/api.js"
import UserRoleForm from "../forms/UserRoleForm.vue"

const users = ref([])
const loading = ref(true)
const errorMessage = ref("")
const selectedUser = ref(null)
const showRoleForm = ref(false)

function formatDate(dateString) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date)) return "—"
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function formatRole(roles) {
  if (!roles || !Array.isArray(roles)) return "Aucun rôle"
  if (roles.includes("ROLE_ADMIN")) return "Admin"
  if (roles.includes("ROLE_USER")) return "Utilisateur"
  return roles[0] || "—"
}

async function fetchUsers() {
  loading.value = true
  errorMessage.value = ""
  try {
    const res = await api.get(`${import.meta.env.VITE_API_URL}/users`)
    users.value = Array.isArray(res.data['hydra:member']) ? res.data['hydra:member'] : []
    gsap.from('.user-row', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power3.out'
    })
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

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="universal-card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="garamond text-3xl font-bold text-white">Manage Users</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10">
      <p class="text-text-gray">Loading users...</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="text-center py-10">
      <p class="text-red-500">{{ errorMessage }}</p>
    </div>

    <!-- User Table -->
    <div v-else-if="users.length > 0" class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="border-b border-border">
          <tr>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider">User</th>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider">Role</th>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider">Date of Birth</th>
            <th class="p-4 text-sm font-semibold text-text-dark uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="user-row border-b border-border hover:bg-bg-hover">
            <td class="p-4">
              <div class="font-medium text-text-white">{{ user.firstname }} {{ user.lastname }}</div>
              <div class="text-sm text-text-dark">{{ user.email }}</div>
            </td>
            <td class="p-4">
              <span :class="user.roles && user.roles.includes('ROLE_ADMIN') ? 'bg-gold/10 text-gold' : 'bg-text-gray/10 text-text-gray'" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ formatRole(user.roles) }}
              </span>
            </td>
            <td class="p-4 text-text-white">
              {{ user.dob ? formatDate(user.dob.date) : "—" }}
            </td>
            <td class="p-4 text-right">
              <button @click="openRoleForm(user)" class="text-gold hover:text-gold-light font-semibold transition-colors">Edit Role</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-10">
      <p class="text-text-gray">No users found.</p>
    </div>

    <UserRoleForm
      v-if="showRoleForm && selectedUser"
      :user="selectedUser"
      @updated="handleRoleUpdated"
      @cancel="closeRoleForm"
    />
  </div>
</template>
