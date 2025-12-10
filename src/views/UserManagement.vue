<script setup>
import { ref, onMounted } from "vue"
import { gsap } from 'gsap'
import api from "/src/api/api.js"
import UserRoleForm from "../components/UserRoleForm.vue"

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
    users.value = Array.isArray(res.data.member) ? res.data.member : []
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
  gsap.from('.page-title', {
    opacity: 0,
    y: -50,
    duration: 0.8,
    ease: 'power3.out'
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0f]">
    <div class="max-w-7xl mx-auto px-6 py-20 space-y-12">

      <div class="page-title">
        <div class="text-[#FFD700] text-[10px] tracking-[0.3em] mb-2">ADMINISTRATION</div>
        <h1 class="garamond text-6xl md:text-7xl font-bold text-white mb-3">Gestion des utilisateurs</h1>
        <div class="h-1 w-24 bg-gradient-to-r from-[#FFD700] to-transparent" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center min-h-[40vh]">
        <div class="flex gap-2">
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="text-center py-20">
        <div class="inline-block p-6 bg-[#16181E] rounded-full mb-6">
          <svg class="w-12 h-12 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <p class="text-[#C1C1C7] text-lg">{{ errorMessage }}</p>
      </div>

      <!-- User Table -->
      <div v-else-if="users.length > 0" class="bg-[#16181E] shadow-lg rounded-lg overflow-hidden border border-[#2A2D36]">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-[#2A2D36]">
            <thead class="bg-[#1E2129]">
              <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-[#82828A] uppercase tracking-wider">Utilisateur</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-[#82828A] uppercase tracking-wider">Rôle</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-[#82828A] uppercase tracking-wider">Date de naissance</th>
                <th scope="col" class="relative px-6 py-4">
                  <span class="sr-only">Modifier</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#2A2D36]">
              <tr v-for="user in users" :key="user.id" class="user-row hover:bg-[#1E2129] transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">{{ user.firstname }} {{ user.lastname }}</div>
                      <div class="text-sm text-[#82828A]">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="user.roles && user.roles.includes('ROLE_ADMIN') ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'bg-[#C1C1C7]/10 text-[#C1C1C7]'" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ formatRole(user.roles) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {{ user.dob ? formatDate(user.dob.date) : "—" }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="openRoleForm(user)" class="px-4 py-2 border border-[#FFD700] text-[#FFD700] rounded-lg text-xs hover:bg-[#FFD700] hover:text-black transition-colors">Modifier</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div class="inline-block p-6 bg-[#16181E] rounded-full mb-6">
          <svg class="w-12 h-12 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-6-6h6z" /></svg>
        </div>
        <p class="text-[#C1C1C7] text-lg">Aucun utilisateur trouvé.</p>
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
