<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Créer une instance axios sans authentification pour l'inscription
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
    photoFile.value = file

    // Créer un aperçu de l'image
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  // Reset le input file
  const fileInput = document.getElementById('photo')
  if (fileInput) {
    fileInput.value = ''
  }
}

const uploadPhoto = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    console.log('Tentative upload vers:', '/media_objects.jsonld')
    console.log('Fichier:', file.name, file.size, 'bytes')

    // Utiliser apiPublic (sans token)
    const response = await apiPublic.post('/media_objects.jsonld', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    console.log('Photo uploadée avec succès:', response.data)

    // Construire l'IRI à partir de l'ID
    const iri = `/api/media_objects/${response.data.id}`
    console.log('IRI de la photo:', iri)
    return iri
  } catch (error) {
    console.error('Erreur upload photo:', error)
    console.error('Status:', error.response?.status)
    console.error('Détails:', error.response?.data)
    console.error('URL appelée:', error.config?.url)
    throw new Error("Erreur lors de l'upload de la photo")
  }
}

const register = async (e) => {
  e.preventDefault()
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    let photoIri = null

    // 1. Upload de la photo si elle existe
    if (photoFile.value) {
      photoIri = await uploadPhoto(photoFile.value)
    }

    // 2. Création de l'utilisateur avec la référence à la photo
    const userData = {
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      plainPassword: password.value,
      dob: dob.value,
    }

    // Ajouter la photo seulement si elle existe
    if (photoIri) {
      userData.photo = photoIri
    }

    console.log('Données utilisateur à envoyer:', userData)

    // Utiliser apiPublic (sans token) pour l'inscription
    await apiPublic.post(import.meta.env.VITE_API_URL_REGISTER, userData, {
      headers: { 'Content-Type': 'application/ld+json' }
    })

    successMessage.value = 'Compte créé avec succès ! Redirection...'

    setTimeout(() => {
      router.push('/')
    }, 2000)

  } catch (error) {
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.response?.data?.['hydra:description']) {
      errorMessage.value = error.response.data['hydra:description']
    } else if (error.response?.data?.detail) {
      errorMessage.value = error.response.data.detail
    } else if (error.response?.status === 500) {
      // Erreur 500 souvent = email déjà utilisé
      errorMessage.value = "Une erreur s'est produite. L'email est peut-être déjà utilisé."
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = "Une erreur est survenue lors de l'inscription"
    }
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-8 py-4">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
      <div class="text-center mb-8">
        <img src="/logo.png" alt="Logo" class="mx-auto h-20 w-auto" />
        <h2 class="mt-2 text-3xl font-semibold text-gray-900">Créer un compte</h2>
      </div>

      <form @submit="register" class="space-y-6">
        <!-- Photo de profil -->
        <div class="flex flex-col items-center">
          <div v-if="photoPreview" class="relative mb-4">
            <img
                :src="photoPreview"
                alt="Aperçu photo"
                class="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
            />
            <button
                type="button"
                @click="removePhoto"
                class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <label
              for="photo"
              class="cursor-pointer bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-2xl transition text-gray-700 font-medium"
          >
            {{ photoPreview ? 'Changer la photo' : 'Ajouter une photo de profil' }}
          </label>
          <input
              type="file"
              id="photo"
              accept="image/*"
              @change="handleFileChange"
              class="hidden"
          />
          <p class="text-xs text-gray-500 mt-2">(Optionnel)</p>
        </div>

        <div>
          <label for="firstname" class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
          <input
              v-model="firstname"
              type="text"
              id="firstname"
              autocomplete="given-name"
              required
              placeholder="Votre prénom"
              class="w-full px-5 py-3 rounded-2xl bg-gray-100 border-0 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
          />
        </div>

        <div>
          <label for="lastname" class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
          <input
              v-model="lastname"
              type="text"
              id="lastname"
              autocomplete="family-name"
              required
              placeholder="Votre nom"
              class="w-full px-5 py-3 rounded-2xl bg-gray-100 border-0 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
              v-model="email"
              type="email"
              id="email"
              autocomplete="email"
              required
              placeholder="votre.email@example.com"
              class="w-full px-5 py-3 rounded-2xl bg-gray-100 border-0 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
          <input
              v-model="password"
              type="password"
              id="password"
              required
              placeholder="********"
              autoComplete="off"
              class="w-full px-5 py-3 rounded-2xl bg-gray-100 border-0 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
          />
        </div>

        <div>
          <label for="dob" class="block text-sm font-medium text-gray-700 mb-2">
            Date de naissance
          </label>
          <input
              v-model="dob"
              type="date"
              id="dob"
              placeholder="ex: 1990-05-15"
              required
              class="w-full px-5 py-3 rounded-2xl bg-gray-100 border-0 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
          />
        </div>

        <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-200 active:scale-95 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Inscription en cours...' : 'S\'inscrire' }}
        </button>

        <p v-if="successMessage" class="mt-4 text-center text-green-600 text-sm">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="mt-4 text-center text-red-600 text-sm">
          {{ errorMessage }}
        </p>
      </form>

      <p class="mt-6 text-center text-gray-500 text-sm">
        Déjà un compte ?
        <router-link to="/" class="text-blue-500 font-semibold hover:text-blue-600">
          Se connecter
        </router-link>
      </p>
    </div>
  </div>
</template>