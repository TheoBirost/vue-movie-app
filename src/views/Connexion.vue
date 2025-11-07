<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import api from '/src/api/api.js'

const router = useRouter()
const emit = defineEmits(['login-success'])

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const login = async (e) => {
  e.preventDefault()
  errorMessage.value = ''

  try {
    // Authentification
    const response = await axios.post(import.meta.env.VITE_API_URL_AUTH, {
      email: email.value,
      password: password.value
    })

    const token = response.data.token
    localStorage.setItem('token', token)
    localStorage.setItem('loggedIn', 'true')

    // ✅ Après la connexion : on récupère la photo utilisateur
    const userRes = await api.get(import.meta.env.VITE_API_URL_USER)
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const photo = userRes.data.photo
        ? `${baseUrl}${userRes.data.photo}`
        : '/default-avatar.png'

    // On garde la photo en cache
    localStorage.setItem('userPhoto', photo)

    // 👇 Et on envoie la photo à App.vue
    emit('login-success', photo)

    // Puis redirection
    await router.push('/home')

  } catch (error) {
    errorMessage.value = "Email ou mot de passe incorrect"
  }
}
</script>


<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
      <div class="text-center mb-8">
        <img src="/logo.png" alt="Logo" class="mx-auto h-20 w-auto" />
        <h2 class="mt-6 text-3xl font-semibold text-gray-900">Connexion à votre compte</h2>
      </div>

      <form @submit="login" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
              v-model="email"
              type="email"
              id="email"
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

        <button
            type="submit"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-200 active:scale-95 text-lg"
        >
          Se connecter
        </button>

        <p class="text-center text-gray-500 text-sm mt-4">
          Pas de compte ?
          <router-link to="/inscription" class="text-blue-500 font-semibold hover:text-blue-600">
            S'inscrire
          </router-link>
        </p>

        <p v-if="errorMessage" class="mt-4 text-center text-red-600 text-sm">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </div>
</template>
