<script setup>
import { ref, onMounted } from "vue"
import api from "/src/api/api.js"

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const dob = ref("")
const errorMessage = ref("")
const userRole = ref("")
const formattedRole = ref("")
const photo = ref("")
const loading = ref(false)

function formatDate(dateString) {
  if (!dateString) return "Non renseignée"
  const [year, month, day] = dateString.split(" ")[0].split("-")
  return `${day}/${month}/${year}`
}

function formatRole(role) {
  switch (role) {
    case "ROLE_ADMIN":
      return "Administrateur"
    case "ROLE_USER":
      return "Utilisateur"
    default:
      return role || "Aucun rôle"
  }
}

async function fetchUser() {
  loading.value = true
  errorMessage.value = ""
  try {
    const res = await api.get(import.meta.env.VITE_API_URL_USER)
    if (res.data) {
      firstName.value = res.data.firstName || "Non renseignée"
      lastName.value = res.data.lastName || "Non renseignée"
      email.value = res.data.email || "Non renseignée"
      userRole.value = res.data.roles ? res.data.roles[0] : "Non renseignée"
      formattedRole.value = formatRole(userRole.value)

      const baseUrl = import.meta.env.VITE_API_BASE_URL
      photo.value = res.data.photo
          ? `${baseUrl}${res.data.photo}`
          : "/default-avatar.png"
      localStorage.setItem("userPhoto", photo.value)
      dob.value = res.data.dob?.date ? formatDate(res.data.dob.date) : "Non renseignée"
    }
  } catch (err) {
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
  <div class="min-h-screen  text-gray-800">
    <section class="max-w-3xl mx-auto px-6 py-20">
      <div v-if="loading" class="text-center py-20">
        <p class="text-gray-400 text-lg animate-pulse">Chargement...</p>
      </div>

      <div v-else-if="errorMessage" class="text-center py-20">
        <p class="text-gray-400 text-lg font-medium">{{ errorMessage }}</p>
        <router-link
            v-if="errorMessage"
            to="/"
            class="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 active:scale-95  items-center gap-1"
        >
          <span>Se reconnecter</span>
        </router-link>
      </div>

      <div v-else>
        <div class="text-center mb-12">
          <div class="flex justify-center mb-6">
            <img
                :src="photo"
                alt="Photo de profil"
                class="w-28 h-28 rounded-full object-cover shadow-md ring-2 ring-gray-200"
            />
          </div>

          <h2 class="text-2xl font-semibold mb-2">{{ firstName }} {{ lastName }}</h2>
          <span
              class="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full uppercase tracking-wide"
          >
            {{ formattedRole }}
          </span>
        </div>

        <div
            class="bg-white rounded-xl shadow-md border border-gray-100 divide-y divide-gray-100"
        >
          <div
              v-for="(info, label) in {
              'Prenom': firstName,
              'Nom': lastName,
              'Email': email,
              'Date de naissance': dob
            }"
              :key="label"
              class="flex justify-between items-center p-6 hover:bg-gray-50 transition-colors duration-150"
          >
            <p class="text-sm text-gray-500">{{ label }}</p>
            <p class="text-base font-medium text-gray-800 text-right break-all">
              {{ info }}
            </p>
          </div>
        </div>

        <div class="flex justify-center mt-10 space-x-5">
          <button
              class="px-6 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm transition-all duration-200"
          >
            Modifier le profil
          </button>

          <button
              class="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-all duration-200 active:scale-95 text-sm"
          >
            Changer la photo
          </button>
          <div v-if="userRole === 'ROLE_ADMIN'">
          <button
                class="px-6 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-all duration-200 active:scale-95 text-sm"
            >
              Gérer les Users
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
