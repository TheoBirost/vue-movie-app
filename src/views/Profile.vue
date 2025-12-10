<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import api from "/src/api/api.js"
import ConfirmDeleteUser from "../components/ConfirmDeleteUser.vue"
import UserForm from '../components/UserForm.vue'

const userId = ref(null)
const firstname = ref("")
const lastname = ref("")
const email = ref("")
const dob = ref("")
const errorMessage = ref("")
const userRole = ref("")
const formattedRole = ref("")
const photo = ref("")
const loading = ref(true)
const uploadingPhoto = ref(false)

const router = useRouter()
const showConfirm = ref(false)
const userToDelete = ref(null)
const showForm = ref(false)
const selectedUser = ref(null)

const fileInput = ref(null)
const selectedFile = ref(null)

const confirmDelete = (user) => {
  userToDelete.value = user
  showConfirm.value = true
}

const editUser = (user) => {
  selectedUser.value = { ...user }
  showForm.value = true
}

const deleteUser = async () => {
  try {
    await api.delete(`/users/${userToDelete.value.id}`)
    showConfirm.value = false
    userToDelete.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userPhoto')
    router.push('/inscription')
  } catch (err) {
    console.error("Erreur suppression :", err)
    errorMessage.value = "Erreur lors de la suppression"
  }
}

function formatDate(dateString) {
  if (!dateString) return "Non spécifié"
  const date = new Date(dateString)
  if (isNaN(date)) return "Date invalide"
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function formatRole(roleStr) {
  switch (roleStr) {
    case "ROLE_ADMIN": return "Administrateur"
    case "ROLE_USER": return "Utilisateur"
    default: return roleStr || "Aucun rôle"
  }
}

async function fetchUser() {
  loading.value = true
  errorMessage.value = ""
  try {
    const res = await api.get(import.meta.env.VITE_API_URL_USER)
    if (res.data) {
      userId.value = res.data.id
      firstname.value = res.data.firstname || ""
      lastname.value = res.data.lastname || ""
      email.value = res.data.email || ""
      userRole.value = res.data.roles ? res.data.roles[0] : "ROLE_USER"
      formattedRole.value = formatRole(userRole.value)
      localStorage.setItem("role", userRole.value === "ROLE_ADMIN" ? "admin" : "user")
      const baseUrl = import.meta.env.VITE_API_BASE_URL
      photo.value = res.data.photo ? `${baseUrl}${res.data.photo}` : "/default-avatar.png"
      localStorage.setItem("userPhoto", photo.value)
      dob.value = res.data.dob?.date ? res.data.dob.date.split(' ')[0] : ""
    }
  } catch (err) {
    console.error("Erreur récupération profil:", err)
    errorMessage.value = err.response?.data?.message || err.message || "Impossible de récupérer les informations"
  } finally {
    loading.value = false
  }
}

const openFilePicker = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 5 Mo.')
      return
    }
    selectedFile.value = file
    uploadPhoto()
  }
}

const uploadPhoto = async () => {
  if (!selectedFile.value || !userId.value) return
  uploadingPhoto.value = true

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const uploadResponse = await api.post('/media_objects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    const photoIri = uploadResponse.data['@id'] || `/api/media_objects/${uploadResponse.data.id}`

    await api.patch(`/users/${userId.value}`, { photo: photoIri }, {
      headers: { 'Content-Type': 'application/merge-patch+json' }
    })

    await fetchUser()
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    alert('Photo mise à jour avec succès !')
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la photo :', error)
    alert("Erreur lors de l'envoi de la photo.")
  } finally {
    uploadingPhoto.value = false
  }
}

onMounted(() => {
  fetchUser()
  gsap.from('.profile-card', {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: 'power3.out'
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0f]">
    <div class="max-w-4xl mx-auto px-6 py-20">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
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
        <p class="text-[#C1C1C7] text-lg mb-6">{{ errorMessage }}</p>
        <router-link to="/connexion" class="px-8 py-4 bg-[#FFD700] hover:bg-[#FFE55C] text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-[0.2em]">
          SE RECONNECTER
        </router-link>
      </div>

      <!-- Profile Content -->
      <div v-else class="profile-card space-y-12">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="relative group">
            <img :src="photo" alt="Photo de profil" class="w-32 h-32 rounded-full object-cover border-4 border-[#FFD700] shadow-lg">
            <button @click="openFilePicker" :disabled="uploadingPhoto" class="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg v-if="!uploadingPhoto" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <svg v-else class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" class="hidden">
          </div>
          <div class="text-center md:text-left">
            <h1 class="garamond text-5xl font-bold text-white">{{ firstname }} {{ lastname }}</h1>
            <p class="text-[#FFD700] tracking-[0.2em] text-sm">{{ formattedRole }}</p>
          </div>
        </div>

        <div class="bg-[#16181E] border border-[#2A2D36] rounded-lg p-8 space-y-6">
          <h2 class="text-white font-bold text-2xl garamond border-b border-[#2A2D36] pb-4 mb-4">Informations personnelles</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <div>
              <span class="text-[#82828A] text-sm uppercase tracking-wider">Prénom</span>
              <p class="text-white font-semibold mt-1">{{ firstname }}</p>
            </div>
            <div>
              <span class="text-[#82828A] text-sm uppercase tracking-wider">Nom</span>
              <p class="text-white font-semibold mt-1">{{ lastname }}</p>
            </div>
            <div>
              <span class="text-[#82828A] text-sm uppercase tracking-wider">Email</span>
              <p class="text-white font-semibold mt-1">{{ email }}</p>
            </div>
            <div>
              <span class="text-[#82828A] text-sm uppercase tracking-wider">Date de naissance</span>
              <p class="text-white font-semibold mt-1">{{ formatDate(dob) }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
          <button @click="editUser({ id: userId, firstname, lastname, email, dob, roles: [userRole], photo })" class="flex-1 px-8 py-4 bg-[#FFD700] hover:bg-[#FFE55C] text-black font-bold rounded-lg transition-all hover:scale-105 text-xs tracking-[0.2em]">MODIFIER LE PROFIL</button>
          <router-link v-if="userRole === 'ROLE_ADMIN'" to="/users" class="flex-1 text-center px-8 py-4 border border-[#FFD700] hover:bg-[#FFD700] hover:text-black text-[#FFD700] font-bold rounded-lg transition-all text-xs tracking-[0.2em]">GÉRER LES UTILISATEURS</router-link>
        </div>

        <div class="border-t border-[#2A2D36] pt-8 mt-12">
          <h3 class="text-lg font-semibold text-red-500 mb-2">Zone de danger</h3>
          <p class="text-[#82828A] mb-4">La suppression de votre compte est une action irréversible.</p>
          <button @click="confirmDelete({ id: userId, firstname, lastname, email, dob, roles: [userRole] })" class="w-full px-8 py-4 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 font-bold rounded-lg transition-all text-xs tracking-[0.2em]">SUPPRIMER MON COMPTE</button>
        </div>
      </div>
    </div>

    <UserForm v-if="showForm" :user="selectedUser" @close="showForm = false" @refresh="fetchUser"/>
    <ConfirmDeleteUser v-if="showConfirm" :user="userToDelete" @cancel="showConfirm = false" @confirm="deleteUser"/>
  </div>
</template>
