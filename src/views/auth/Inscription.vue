<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { gsap } from 'gsap'
import ThreeBackground from '../../components/common/ThreeBackground.vue'

const router = useRouter()

const apiPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Accept': 'application/ld+json'
  }
})

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const password = ref('')
const dob = ref('')
const photoFile = ref(null)
const photoPreview = ref(null)
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 5 Mo.')
      return
    }
    photoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => photoPreview.value = e.target.result
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  const fileInput = document.getElementById('photo-upload')
  if (fileInput) fileInput.value = ''
}

const uploadPhoto = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiPublic.post('/media_objects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data['@id'] || `/api/media_objects/${response.data.id}`
}

const register = async (e) => {
  e.preventDefault()
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    let photoIri = null
    if (photoFile.value) photoIri = await uploadPhoto(photoFile.value)

    const userData = {
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      plainPassword: password.value,
      dob: dob.value,
    }
    if (photoIri) userData.photo = photoIri

    await apiPublic.post(import.meta.env.VITE_API_URL_REGISTER, userData, {
      headers: { 'Content-Type': 'application/ld+json' }
    })

    successMessage.value = 'Compte créé avec succès ! Redirection...'
    setTimeout(() => router.push('/connexion'), 2000)
  } catch (error) {
    errorMessage.value =
        error.response?.data?.message ||
        error.response?.data?.['hydra:description'] ||
        error.response?.data?.detail ||
        (error.response?.status === 500
            ? "Une erreur est survenue. L'email est peut-être déjà utilisé."
            : error.message) ||
        "Une erreur est survenue lors de l'inscription."
    nextTick(() => {
      gsap.fromTo('.error-message', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  gsap.from('.auth-card', {
    opacity: 0,
    scale: 0.9,
    duration: 0.8,
    ease: 'power3.out'
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0f] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
    <ThreeBackground />
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05),transparent_60%)]"></div>

    <div class="auth-card w-full max-w-lg space-y-8 z-10">
      <div class="text-center">
        <h1 class="garamond text-6xl font-bold text-[#FFD700]">Cinéaste</h1>
        <h2 class="mt-2 text-2xl font-bold text-white">
          Créez votre compte
        </h2>
        <p class="mt-2 text-sm text-[#C1C1C7]">
          Vous avez déjà un compte ?
          <router-link to="/connexion" class="font-medium text-[#FFD700] hover:text-[#FFE55C]">
            Connectez-vous
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6 bg-[#16181E] p-8 rounded-lg shadow-2xl border border-[#2A2D36]" @submit="register">
        <div class="flex flex-col items-center space-y-4">
          <div class="relative">
            <img :src="photoPreview || '/default-avatar.png'" alt="Aperçu de l'avatar" class="w-24 h-24 rounded-full object-cover border-4 border-[#2A2D36]">
            <button v-if="photoPreview" @click="removePhoto" type="button" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all">&times;</button>
          </div>
          <label for="photo-upload" class="cursor-pointer px-4 py-2 border border-[#FFD700] text-[#FFD700] rounded-lg text-sm hover:bg-[#FFD700] hover:text-black transition-colors">
            Choisir une photo
          </label>
          <input id="photo-upload" name="photo" type="file" class="sr-only" @change="handleFileChange" accept="image/*">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="firstname" class="text-[#C1C1C7] text-sm tracking-wider uppercase">Prénom</label>
            <input v-model="firstname" id="firstname" name="firstname" type="text" required class="mt-2 appearance-none rounded-md relative block w-full px-4 py-3 border border-[#2A2D36] bg-[#0d0d0f] placeholder-gray-500 text-white focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] sm:text-sm transition-all" placeholder="Jean">
          </div>
          <div>
            <label for="lastname" class="text-[#C1C1C7] text-sm tracking-wider uppercase">Nom</label>
            <input v-model="lastname" id="lastname" name="lastname" type="text" required class="mt-2 appearance-none rounded-md relative block w-full px-4 py-3 border border-[#2A2D36] bg-[#0d0d0f] placeholder-gray-500 text-white focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] sm:text-sm transition-all" placeholder="Dupont">
          </div>
        </div>

        <div>
          <label for="email-address" class="text-[#C1C1C7] text-sm tracking-wider uppercase">Email</label>
          <input v-model="email" id="email-address" name="email" type="email" autocomplete="email" required class="mt-2 appearance-none rounded-md relative block w-full px-4 py-3 border border-[#2A2D36] bg-[#0d0d0f] placeholder-gray-500 text-white focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] sm:text-sm transition-all" placeholder="votre@email.com">
        </div>

        <div>
          <label for="password" class="text-[#C1C1C7] text-sm tracking-wider uppercase">Mot de passe</label>
          <input v-model="password" id="password" name="password" type="password" autocomplete="new-password" required class="mt-2 appearance-none rounded-md relative block w-full px-4 py-3 border border-[#2A2D36] bg-[#0d0d0f] placeholder-gray-500 text-white focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] sm:text-sm transition-all" placeholder="********">
        </div>

        <div>
          <label for="dob" class="text-[#C1C1C7] text-sm tracking-wider uppercase">Date de naissance</label>
          <input v-model="dob" id="dob" name="dob" type="date" required class="mt-2 appearance-none rounded-md relative block w-full px-4 py-3 border border-[#2A2D36] bg-[#0d0d0f] placeholder-gray-500 text-white focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] sm:text-sm">
        </div>

        <div v-if="successMessage" class="text-green-400 text-sm text-center bg-green-900/20 p-3 rounded-md border border-green-800/30">{{ successMessage }}</div>
        <div v-if="errorMessage" class="error-message text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-md border border-red-800/30">{{ errorMessage }}</div>

        <div>
          <button :disabled="isLoading" type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-black bg-[#FFD700] hover:bg-[#FFE55C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-black animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </span>
            {{ isLoading ? 'Création du compte...' : 'Créer le compte' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
