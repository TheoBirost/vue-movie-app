<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const emit = defineEmits(['login-success'])

const email = ref('') // remet à vide
const password = ref('')
const errorMessage = ref('')

// Connexion à l'API Symfony
const login = async (e) => {
  e.preventDefault()
  errorMessage.value = ''

  try {
    // 🔹 1. Envoi des identifiants à ton API
    const response = await axios.post('http://localhost:8319/auth', {
      email: email.value,
      password: password.value
    })

    // 🔹 2. Récupération du token JWT renvoyé par le back
    const token = response.data.token


    // 🔹 3. Sauvegarde du token dans le localStorage
    localStorage.setItem('token', token)

    // 🔹 4. Éventuellement, sauvegarde un état "connecté"
    localStorage.setItem('loggedIn', 'true')

    // 🔹 5. Redirection vers la page d'accueil
    emit('login-success')
    router.push('/home')

  } catch (error) {
    console.error('Erreur de connexion :', error)
    errorMessage.value = "Email ou mot de passe incorrect"
  }
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-24 w-auto" src="/logo.png" alt="Your Company" />
      <h2 class="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
        Connexion au compte
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit="login">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-900">Email</label>
          <input
              v-model="email"
              type="email"
              id="email"
              required
              class="block w-full rounded-md border px-3 py-1.5 text-gray-900"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-900">Mot de passe</label>
          <input
              v-model="password"
              type="password"
              id="password"
              required
              class="block w-full rounded-md border px-3 py-1.5 text-gray-900"
          />
        </div>

        <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Se connecter
        </button>

        <p v-if="errorMessage" class="mt-2 text-sm text-red-600 text-center">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </div>
</template>
