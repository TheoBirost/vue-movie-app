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
  if (!roles || !Array.isArray(roles)) return "No role"
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
      errorMessage.value = `Error ${err.response.status}`
    } else if (err.request) {
      errorMessage.value = "Could not retrieve users"
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
  <div class="min-h-screen bg-color-bg text-color-text">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header class="mb-12" data-aos="fade-down">
        <h1 class="text-5xl font-gloock font-bold text-color-heading">User Management</h1>
        <p class="mt-2 text-lg text-color-text">Manage user roles and permissions.</p>
      </header>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="w-16 h-16 border-4 border-color-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="errorMessage" class="text-center py-16 text-red-500" data-aos="fade-up">
        <p>{{ errorMessage }}</p>
      </div>

      <div v-else-if="users.length > 0" class="bg-color-surface shadow-lg rounded-lg overflow-hidden border border-color-border" data-aos="fade-up">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-color-border">
            <thead class="bg-color-bg">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-color-text uppercase tracking-wider">User</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-color-text uppercase tracking-wider">Role</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-color-text uppercase tracking-wider">Date of Birth</th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-color-border">
              <tr v-for="user in users" :key="user.id" class="hover:bg-color-bg transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-color-heading">{{ user.firstname }} {{ user.lastname }}</div>
                      <div class="text-sm text-color-text">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="user.roles && user.roles.includes('ROLE_ADMIN') ? 'bg-color-primary/20 text-color-primary' : 'bg-color-muted/20 text-color-muted'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ formatRole(user.roles) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-color-text">
                  {{ user.dob ? formatDate(user.dob) : "—" }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="openRoleForm(user)" class="btn-secondary">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div v-else class="text-center py-20 text-color-text" data-aos="fade-up">
        <p>No users found.</p>
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
