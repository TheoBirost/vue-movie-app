<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { gsap } from 'gsap'
import api from '/src/api/api.js'
import ParticleField from '../../components/common/ParticleField.vue'

const router = useRouter()
const route = useRoute()
const emit = defineEmits(['login-success'])

const email = ref('')
const password = ref('')
const authCode = ref('')
const errorMessage = ref('')
const loading = ref(false)
const twoFactorRequired = ref(false)
const twoFactorToken = ref(null)

const handleLoginSuccess = async (token) => {
  localStorage.setItem('token', token)
  localStorage.setItem('loggedIn', 'true')
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`

  const userRes = await api.get(import.meta.env.VITE_API_URL_USER)
  const user = userRes.data

  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const photo = user.photo ? `${baseUrl}${user.photo}` : '/placeholder-avatar.svg'

  localStorage.setItem('userPhoto', photo)
  if (user.roles && user.roles.length > 0) {
    const isAdmin = user.roles.includes('ROLE_ADMIN')
    localStorage.setItem('role', isAdmin ? 'admin' : 'user')
  } else {
    localStorage.setItem('role', 'user')
  }

  emit('login-success', photo)

  // Le garde de route ajoute ?redirect=… quand une page protégée a été
  // demandée avant connexion : on y retourne au lieu de renvoyer à l'accueil.
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  // Un chemin interne uniquement : une valeur commençant par // ou http://
  // permettrait de rediriger la victime vers un site tiers après connexion.
  const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'
  await router.push(safeRedirect)
}

const login = async (e) => {
  e.preventDefault()
  errorMessage.value = ''
  loading.value = true

  try {
    // Utilisation de l'URL d'authentification définie dans les variables d'environnement
    const response = await axios.post(import.meta.env.VITE_API_URL_AUTH, {
      email: email.value,
      password: password.value
    }, {
      withCredentials: true
    })

    // Si le 2FA est activé, on reçoit un token temporaire
    if (response.data['2fa_required']) {
      twoFactorToken.value = response.data.token
      twoFactorRequired.value = true
      gsap.to('.auth-card', {
        height: 'auto',
        duration: 0.5,
        ease: 'power3.inOut'
      })
    } else {
      // Sinon, on est connecté directement
      await handleLoginSuccess(response.data.token)
    }
  } catch (err) {
    errorMessage.value = "Email ou mot de passe incorrect."
    gsap.fromTo('.error-message', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  } finally {
    loading.value = false
  }
}

const verifyTwoFactor = async (e) => {
  e.preventDefault()
  errorMessage.value = ''
  loading.value = true

  try {
    // On utilise le token temporaire pour s'authentifier sur la route de vérification
    const response = await api.post('/2fa/login/verify', {
      code: authCode.value
    }, {
      headers: { 'Authorization': `Bearer ${twoFactorToken.value}` }
    })

    if (response.data.token) {
      await handleLoginSuccess(response.data.token)
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.error || "Code invalide ou expiré."
    gsap.fromTo('.error-message', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  } finally {
    loading.value = false
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
  <div class="min-h-screen bg-[#0d0d0f] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <ParticleField position="fixed" :count="260" :size="1.5" :speed="0.22" />
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05),transparent_60%)]" aria-hidden="true"></div>

    <div class="auth-card w-full max-w-md space-y-8 z-10">
      <div class="text-center">
        <h1 class="garamond text-6xl font-bold text-[#FFD700]">Cinéaste</h1>
        <h2 class="mt-2 text-2xl font-bold text-white">
          {{ twoFactorRequired ? 'Vérification requise' : 'Connectez-vous' }}
        </h2>
        <p v-if="!twoFactorRequired" class="mt-2 text-sm text-[#C1C1C7]">
          Pas encore de compte ?
          <router-link to="/inscription" class="font-medium text-[#FFD700] hover:text-[#FFE55C]">
            Inscrivez-vous
          </router-link>
        </p>
      </div>

      <!-- Formulaire de Login -->
      <form v-if="!twoFactorRequired" class="mt-8 space-y-6 bg-[#16181E] p-8 rounded-lg shadow-2xl border border-[#2A2D36]" @submit="login">
        <div class="space-y-4">
          <div>
            <label for="email-address" class="text-[#C1C1C7] text-sm tracking-wider uppercase">Email</label>
            <input id="email-address" v-model="email" name="email" type="email" autocomplete="email" required
                   class="mt-2 appearance-none rounded-md relative block w-full px-4 py-3 border border-[#2A2D36] bg-[#0d0d0f] placeholder-gray-500 text-white focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] sm:text-sm transition-all"
                   placeholder="votre@email.com">
          </div>
          <div>
            <label for="password" class="text-[#C1C1C7] text-sm tracking-wider uppercase">Mot de passe</label>
            <input id="password" v-model="password" name="password" type="password" autocomplete="current-password" required
                   class="mt-2 appearance-none rounded-md relative block w-full px-4 py-3 border border-[#2A2D36] bg-[#0d0d0f] placeholder-gray-500 text-white focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] sm:text-sm transition-all"
                   placeholder="********">
          </div>
        </div>

        <div v-if="errorMessage" class="error-message text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-md border border-red-800/30">
          {{ errorMessage }}
        </div>

        <div>
          <button type="submit" :disabled="loading"
                  class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-black bg-[#FFD700] hover:bg-[#FFE55C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-black animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>
      </form>

      <!-- Formulaire 2FA -->
      <form v-else class="mt-8 space-y-6 bg-[#16181E] p-8 rounded-lg shadow-2xl border border-[#2A2D36]" @submit="verifyTwoFactor">
        <p class="text-center text-[#C1C1C7]">Ouvrez votre application d'authentification et entrez le code pour vous connecter.</p>
        <div class="space-y-4">
          <div>
            <label for="auth-code" class="text-[#C1C1C7] text-sm tracking-wider uppercase">Code de vérification</label>
            <input id="auth-code" v-model="authCode" name="code" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" required
                   class="mt-2 appearance-none rounded-md relative block w-full px-4 py-3 border border-[#2A2D36] bg-[#0d0d0f] placeholder-gray-500 text-white focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] sm:text-sm transition-all text-center text-2xl tracking-[0.2em] font-mono">
          </div>
        </div>

        <div v-if="errorMessage" class="error-message text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-md border border-red-800/30">
          {{ errorMessage }}
        </div>

        <div>
          <button type="submit" :disabled="loading"
                  class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-black bg-[#FFD700] hover:bg-[#FFE55C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-black animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Vérification...' : 'Vérifier' }}
          </button>
        </div>
      </form>

    </div>
  </div>
</template>
