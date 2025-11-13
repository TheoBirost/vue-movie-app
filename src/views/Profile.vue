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
  if (!dateString) return "Non renseignée"
  const [year, month, day] = dateString.split(" ")[0].split("-")
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
      role.value = userRole.value === "ROLE_ADMIN" ? "admin" : "user"
      localStorage.setItem("role", role.value)
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
      alert('Veuillez sélectionner une image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB')
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
    alert('Photo mise à jour !')
  } catch (error) {
    console.error('Erreur upload photo:', error)
    alert("Erreur lors de l'envoi de la photo")
  } finally {
    uploadingPhoto.value = false
  }
}

onMounted(fetchUser)
</script>

<template>
  <div class="min-h-screen bg-[var(--bg-main)]">
    <div class="max-w-3xl mx-auto px-6 py-16">
      <div v-if="loading" class="text-center py-20">
        <p class="text-[var(--text-gray)] animate-pulse">Chargement...</p>
      </div>

      <div v-else-if="errorMessage" class="text-center py-20">
        <p class="text-red-400 mb-6">{{ errorMessage }}</p>
        <router-link to="/" class="px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black font-semibold rounded-lg transition">
          Se reconnecter
        </router-link>
      </div>

      <div v-else class="space-y-8">
        <div class="text-center">
          <div class="relative inline-block mb-4">
            <div v-if="uploadingPhoto" class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-10">
              <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>

            <img :src="photo" alt="Photo" class="w-24 h-24 rounded-full object-cover border-2 border-[var(--gold)]" />

            <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileChange" />

            <button
                @click="openFilePicker"
                :disabled="uploadingPhoto"
                class="absolute bottom-0 right-0 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black w-8 h-8 rounded-full transition flex items-center justify-center disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/>
                <path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/>
              </svg>
            </button>
          </div>

          <h2 class="text-2xl font-bold text-white mb-2">{{ firstname }} {{ lastname }}</h2>
          <span class="inline-block px-3 py-1 text-sm rounded-full" :class="userRole === 'ROLE_ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'">
            {{ formattedRole }}
          </span>
        </div>

        <div class="bg-[var(--bg-card)] rounded-[var(--radius)] border border-[var(--border)] divide-y divide-[var(--border)]">
          <div v-for="(info, label) in { 'Prénom': firstname, 'Nom': lastname, 'Email': email, 'Date de naissance': formatDate(dob) }" :key="label" class="flex justify-between p-4">
            <p class="text-[var(--text-gray)] text-sm">{{ label }}</p>
            <p class="text-white text-sm">{{ info }}</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
              @click.stop="editUser({ id: userId, firstname, lastname, email, dob, roles: [userRole], photo })"
              class="flex-1 px-6 py-3 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black font-semibold rounded-lg transition"
          >
            Modifier
          </button>

          <router-link
              v-if="role === 'admin'"
              to="/users"
              class="flex-1 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-semibold rounded-lg transition text-center"
          >
            Gérer Users
          </router-link>
        </div>

        <div class="pt-8 border-t border-[var(--border)]">
          <h3 class="text-sm font-semibold text-[var(--text-gray)] mb-4">Zone de danger</h3>
          <button
              @click.stop="confirmDelete({ id: userId, firstname, lastname, email, dob, roles: [userRole] })"
              class="w-full px-6 py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 font-semibold rounded-lg transition"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>

    <UserForm v-if="showForm" :user="selectedUser" @close="showForm = false" @refresh="fetchUser"/>
    <ConfirmDeleteUser v-if="showConfirm" :user="userToDelete" @cancel="showConfirm = false" @confirm="deleteUser"/>
  </div>
</template>