<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const register = async (e) => {
  e.preventDefault()
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await axios.post(import.meta.env.VITE_API_URL_USER,
        {
          firstname: firstname.value,
          lastname: lastname.value,
          email: email.value,
          plainPassword: password.value
        },
        {
          headers: {
            'Content-Type': 'application/ld+json'
          }
        }
    )

    successMessage.value = 'Compte créé avec succès ! Redirection...'

    setTimeout(() => {
      router.push('/')
    }, 3000)

  } catch (error) {
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.response?.data?.['hydra:description']) {
      errorMessage.value = error.response.data['hydra:description']
    } else {
      errorMessage.value = "Une erreur est survenue lors de l'inscription"
    }
    console.error(error)
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
              autocomplete="new-password"
              required
              placeholder="********"
              class="w-full px-5 py-3 rounded-2xl bg-gray-100 border-0 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
          />
        </div>

        <button
            type="submit"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-200 active:scale-95 text-lg"
        >
          S'inscrire
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
