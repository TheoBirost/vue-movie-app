<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from 'vue-router'
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
const loading = ref(false)
const uploadingPhoto = ref(false)

const router = useRouter()
const role = ref("user")
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
  if (!dateString) return "Not specified"
  const [year, month, day] = dateString.split(" ")[0].split("-")
  return `${day}-${month}-${year}`
}

function formatRole(roleStr) {
  switch (roleStr) {
    case "ROLE_ADMIN": return "Administrator"
    case "ROLE_USER": return "User"
    default: return roleStr || "No role"
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
      role.value = userRole.value === "ROLE_ADMIN" ? "admin" : "user"
      localStorage.setItem("role", role.value)
      const baseUrl = import.meta.env.VITE_API_BASE_URL
      photo.value = res.data.photo ? `${baseUrl}${res.data.photo}` : "/default-avatar.png"
      localStorage.setItem("userPhoto", photo.value)
      dob.value = res.data.dob?.date ? res.data.dob.date.split(' ')[0] : ""
    }
  } catch (err) {
    console.error("Erreur récupération profil:", err)
    errorMessage.value = err.response?.data?.message || err.message || "Could not retrieve information"
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
      alert('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should not exceed 5MB.')
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
    alert('Photo updated successfully!')
  } catch (error) {
    console.error('Error uploading photo:', error)
    alert("Error uploading photo.")
  } finally {
    uploadingPhoto.value = false
  }
}

onMounted(fetchUser)
</script>

<template>
  <div class="min-h-screen bg-color-bg text-color-text">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="w-16 h-16 border-4 border-color-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="errorMessage" class="text-center py-16 text-red-500" data-aos="fade-up">
        <p class="mb-4">{{ errorMessage }}</p>
        <router-link to="/" class="btn-primary">
          Reconnect
        </router-link>
      </div>

      <div v-else class="space-y-12" data-aos="fade-up">
        <div class="text-center">
          <div class="relative inline-block group">
            <img :src="photo" alt="Profile Photo" class="w-32 h-32 rounded-full object-cover border-4 border-color-primary shadow-lg">
            <button @click="openFilePicker" :disabled="uploadingPhoto" class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg v-if="!uploadingPhoto" class="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <svg v-else class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" class="hidden">
          </div>
          <h1 class="text-4xl font-gloock font-bold text-color-heading mt-4">{{ firstname }} {{ lastname }}</h1>
          <p class="text-color-text">{{ formattedRole }}</p>
        </div>

        <div class="bg-color-surface border border-color-border rounded-lg shadow-lg p-8 space-y-4">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-color-text">First Name</span>
            <span>{{ firstname }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-color-text">Last Name</span>
            <span>{{ lastname }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-color-text">Email</span>
            <span>{{ email }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-color-text">Date of Birth</span>
            <span>{{ formatDate(dob) }}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
          <button @click="editUser({ id: userId, firstname, lastname, email, dob, roles: [userRole], photo })" class="flex-1 btn-primary">Edit Profile</button>
          <router-link v-if="role === 'admin'" to="/users" class="flex-1 text-center btn-secondary">Manage Users</router-link>
        </div>

        <div class="border-t border-color-border pt-8">
          <h3 class="text-lg font-semibold text-color-cinematic-red mb-2">Danger Zone</h3>
          <button @click="confirmDelete({ id: userId, firstname, lastname, email, dob, roles: [userRole] })" class="w-full btn-danger">Delete My Account</button>
        </div>
      </div>
    </div>

    <UserForm v-if="showForm" :user="selectedUser" @close="showForm = false" @refresh="fetchUser"/>
    <ConfirmDeleteUser v-if="showConfirm" :user="userToDelete" @cancel="showConfirm = false" @confirm="deleteUser"/>
  </div>
</template>
