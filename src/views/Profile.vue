<script setup>
import { ref, onMounted } from "vue"
import api from "/src/api/api.js"

// const id = ref("")
const firstName = ref("")
const lastName = ref("")
const email = ref("")
const dob = ref("")
const error = ref("")
const userRole = ref("")
const photo = ref("")

function formatDate(dateString) {
  if (!dateString) return ""
  const [year, month, day] = dateString.split(" ")[0].split("-")
  return `${day} / ${month} / ${year}`
}

function formatRole(role) {
  switch (role) {
    case "ROLE_ADMIN":
      return "ADMIN"
    case "ROLE_USER":
      return "USER"
    default:
      return role || "Aucun rôle"
  }
}

async function fetchUser() {
  try {
    const res = await api.get(import.meta.env.VITE_API_URL_USER)


    if (res.data) {
      firstName.value = res.data.firstName || "Non renseignée"
      lastName.value = res.data.lastName || "Non renseignée"
      email.value = res.data.email || "Non renseignée"
      userRole.value = res.data.roles ? formatRole(res.data.roles[0]) : "Aucun rôle"


      const baseUrl = (import.meta.env.VITE_API_BASE_URL)
      photo.value = res.data.photo
          ? `${baseUrl}${res.data.photo}`
          : "/default-avatar.png"
      localStorage.setItem('userPhoto', photo.value)
      dob.value = res.data.dob?.date ? formatDate(res.data.dob.date) : "Non renseignée"


    }
  } catch (err) {
    error.value = "Erreur 401 : Expired JWT Token"
  }
}

onMounted(fetchUser)
</script>

<template>
  <section class="p-4">
    <!--
    <h1><strong>ID :</strong> {{ id }}</h1>
    -->
    <h1><strong>Rôles :</strong> {{ userRole }}</h1>
    <h1><strong>Prénom :</strong> {{ firstName }}</h1>
    <h1><strong>Nom :</strong> {{ lastName }}</h1>
    <p><strong>Email :</strong> {{ email }}</p>
    <p><strong>Date de naissance :</strong> {{ dob }}</p>

    <label class="mt-10 block text-sm font-medium mb-2">Changer la photo de profil</label>

    <img :src="photo" alt="Photo de profil" class="w-32 h-32  object-cover">


    <div v-if="error" class="text-center py-20 text-gray-400 mt-2">{{ error }}</div>
  </section>
</template>