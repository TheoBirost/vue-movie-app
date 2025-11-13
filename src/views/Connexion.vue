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
    const response = await axios.post(import.meta.env.VITE_API_URL_AUTH, {
      email: email.value,
      password: password.value
    })

    const token = response.data.token
    localStorage.setItem('token', token)
    localStorage.setItem('loggedIn', 'true')

    const userRes = await api.get(import.meta.env.VITE_API_URL_USER)
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const photo = userRes.data.photo
        ? `${baseUrl}${userRes.data.photo}`
        : '/default-avatar.png'

    localStorage.setItem('userPhoto', photo)
    emit('login-success', photo)

    await router.push('/home')
  } catch {
    errorMessage.value = "Email ou mot de passe incorrect"
  }
}
</script>

<template>
  <div class="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-md bg-[var(--bg-card)] rounded-[var(--radius)] border border-[var(--border)] p-8">
      <div class="text-center mb-8">
        <img src="/logo.png" alt="Logo" class="mx-auto h-20 w-auto" />
        <h2 class="mt-6 text-3xl font-semibold text-[var(--gold)]">Connexion</h2>
      </div>

      <form @submit="login" class="space-y-6">
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

        <button
            type="submit"
            class="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black font-semibold px-6 py-3 rounded-lg transition"
        >
          Se connecter
        </button>

        <p class="text-center text-[var(--text-gray)] text-sm">
          Pas de compte ?
          <router-link to="/inscription" class="text-[var(--gold)] hover:text-[var(--gold-light)]">
            S'inscrire
          </router-link>
        </p>

        <p v-if="errorMessage" class="text-center text-red-400 text-sm">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </div>
</template>