<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

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
    photoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => photoPreview.value = e.target.result
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  const fileInput = document.getElementById('photo')
  if (fileInput) fileInput.value = ''
}

const uploadPhoto = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiPublic.post('/media_objects.jsonld', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return `/api/media_objects/${response.data.id}`
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
    setTimeout(() => router.push('/'), 2000)
  } catch (error) {
    errorMessage.value =
        error.response?.data?.message ||
        error.response?.data?.['hydra:description'] ||
        error.response?.data?.detail ||
        (error.response?.status === 500
            ? "Une erreur s'est produite. L'email est peut-être déjà utilisé."
            : error.message) ||
        "Une erreur est survenue lors de l'inscription"
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-md bg-[var(--bg-card)] rounded-[var(--radius)] border border-[var(--border)] p-8">
      <div class="text-center mb-8">
        <img src="/logo.png" alt="Logo" class="mx-auto h-20 w-auto" />
        <h2 class="mt-6 text-3xl font-semibold text-[var(--gold)]">Créer un compte</h2>
      </div>

      <form @submit="register" class="space-y-6">
        <div class="flex flex-col items-center">
          <div v-if="photoPreview" class="relative mb-4">
            <img
                :src="photoPreview"
                alt="Aperçu photo"
                class="w-24 h-24 rounded-full object-cover border-2 border-[var(--gold)]"
            />
            <button
                type="button"
                @click="removePhoto"
                class="absolute top-0 right-0 bg-[var(--gold)] text-black rounded-full p-1.5 hover:bg-[var(--gold-light)] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <label
              for="photo"
              class="cursor-pointer bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] px-4 py-2 rounded-lg transition text-[var(--text-gray)] text-sm"
          >
            {{ photoPreview ? 'Changer la photo' : 'Ajouter une photo' }}
          </label>
          <input type="file" id="photo" accept="image/*" @change="handleFileChange" class="hidden" />
          <p class="text-xs text-[var(--text-dark)] mt-2">(Optionnel)</p>
        </div>

        <div>
          <label for="firstname" class="block text-sm font-medium text-[var(--text-gray)] mb-2">Prénom</label>
          <input
              v-model="firstname"
              type="text"
              id="firstname"
              required
              placeholder="Votre prénom"
              class="w-full px-4 py-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition"
          />
        </div>

        <div>
          <label for="lastname" class="block text-sm font-medium text-[var(--text-gray)] mb-2">Nom</label>
          <input
              v-model="lastname"
              type="text"
              id="lastname"
              required
              placeholder="Votre nom"
              class="w-full px-4 py-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-[var(--text-gray)] mb-2">Email</label>
          <input
              v-model="email"
              type="email"
              id="email"
              required
              placeholder="votre.email@example.com"
              class="w-full px-4 py-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-[var(--text-gray)] mb-2">Mot de passe</label>
          <input
              v-model="password"
              type="password"
              id="password"
              required
              placeholder="********"
              autoComplete="off"
              class="w-full px-4 py-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition"
          />
        </div>

        <div>
          <label for="dob" class="block text-sm font-medium text-[var(--text-gray)] mb-2">Date de naissance</label>
          <input
              v-model="dob"
              type="date"
              id="dob"
              required
              class="w-full px-4 py-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition"
          />
        </div>

        <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
        >
          {{ isLoading ? 'Inscription...' : 'S\'inscrire' }}
        </button>

        <p v-if="successMessage" class="text-center text-green-400 text-sm">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-center text-red-400 text-sm">{{ errorMessage }}</p>
      </form>

      <p class="mt-6 text-center text-[var(--text-gray)] text-sm">
        Déjà un compte ?
        <router-link to="/" class="text-[var(--gold)] hover:text-[var(--gold-light)]">
          Se connecter
        </router-link>
      </p>
    </div>
  </div>
</template>