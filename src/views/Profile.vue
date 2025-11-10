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

const router = useRouter()

const role = ref("user")
const showConfirm = ref(false)
const userToDelete = ref(null)
const showForm = ref(false)
const selectedUser = ref(null)

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
    await api.delete(`/users/${userToDelete.value.id}`, {
      headers: { 'Content-Type': '' }
    })

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
  return `${day}/${month}/${year}`
}

function formatRole(roleStr) {
  switch (roleStr) {
    case "ROLE_ADMIN":
      return "Administrateur"
    case "ROLE_USER":
      return "Utilisateur"
    default:
      return roleStr || "Aucun rôle"
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
      photo.value = res.data.photo
          ? `${baseUrl}${res.data.photo}`
          : "http://localhost:8319/media/images/default-avatar-690e4f3d71cc3431908037.jpg"
      localStorage.setItem("userPhoto", photo.value)

      dob.value = res.data.dob?.date ? res.data.dob.date.split(' ')[0] : ""
    }
  } catch (err) {
    console.error("Erreur récupération profil:", err)
    if (err.response) {
      errorMessage.value = `Erreur ${err.response.status} : ${err.response.data.message || "Non spécifié"}`
    } else if (err.request) {
      errorMessage.value = "Impossible de récupérer les informations"
    } else {
      errorMessage.value = err.message
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)
</script>

<template>
  <div class="min-h-screen text-gray-800">
    <section class="max-w-3xl mx-auto px-6 py-20">
      <div v-if="loading" class="text-center py-20">
        <p class="text-gray-400 text-lg animate-pulse">Chargement...</p>
      </div>

      <div v-else-if="errorMessage" class="text-center py-20">
        <p class="text-gray-400 text-lg font-medium">{{ errorMessage }}</p>
        <router-link
            v-if="errorMessage"
            to="/"
            class="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 items-center gap-1"
        >
          <span>Se reconnecter</span>
        </router-link>
      </div>

      <div v-else>
        <div class="text-center mb-12">
          <div class="relative inline-block mb-6">
            <img
                :src="photo"
                alt="Photo de profil"
                class="w-28 h-28 rounded-full object-cover shadow-md ring-2 ring-gray-200"
            />
            <button
                class="absolute bottom-0 right-0 bg-white hover:bg-gray-50 text-gray-700 w-9 h-9 rounded-full shadow-lg border border-gray-200 transition-all duration-200 active:scale-95 flex items-center justify-center"
                title="Changer la photo"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <h2 class="text-2xl font-semibold mb-2">{{ firstname }} {{ lastname }}</h2>
          <span
              :class="userRole === 'ROLE_ADMIN'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-green-100 text-green-700'"
              class="inline-block px-3 py-1 text-sm font-medium rounded-full uppercase tracking-wide"
          >
            {{ formattedRole }}
          </span>
        </div>

        <div class="bg-white rounded-xl shadow-md border border-gray-100 divide-y divide-gray-100">
          <div
              v-for="(info, label) in { 'Prénom': firstname, 'Nom': lastname, 'Email': email, 'Date de naissance': formatDate(dob) }"
              :key="label"
              class="flex justify-between items-center p-6 hover:bg-gray-50 transition-colors duration-150"
          >
            <p class="text-sm text-gray-500">{{ label }}</p>
            <p class="text-base font-medium text-gray-800 text-right break-all">{{ info }}</p>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button
              @click.stop="editUser({
        id: userId,
        firstname: firstname,
        lastname: lastname,
        email: email,
        dob: dob,
        roles: [userRole],
        photo: photo
      })"
              class="flex-1 px-6 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Modifier</span>
          </button>

          <router-link
              v-if="role === 'admin'"
              to="/users"
              class="flex-1 px-6 py-3.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Gérer Users</span>
          </router-link>
        </div>

        <div class="mt-12 pt-8 border-t border-gray-200">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Zone de danger</h3>
          <button
              @click.stop="confirmDelete({
                id: userId,
                firstname: firstname,
                lastname: lastname,
                email: email,
                dob: dob,
                roles: [userRole]
              })"
              class="w-full px-6 py-3.5 bg-white hover:bg-red-50 text-red-600 font-medium rounded-xl border-2 border-red-200 hover:border-red-300 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Supprimer mon compte</span>
          </button>
          <p class="text-xs text-gray-500 mt-2 text-center">
            Cette action est irréversible et supprimera définitivement votre compte
          </p>
        </div>
      </div>
    </section>

    <UserForm
        v-if="showForm"
        :user="selectedUser"
        @close="showForm = false"
        @refresh="fetchUser"
    />
    <ConfirmDeleteUser
        v-if="showConfirm"
        :user="userToDelete"
        @cancel="showConfirm = false"
        @confirm="deleteUser"
    />
  </div>
</template>