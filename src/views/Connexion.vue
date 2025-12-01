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
    errorMessage.value = "Incorrect email or password"
  }
}
</script>

<template>
  <div class="min-h-screen bg-color-bg flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8" data-aos="fade-up">
      <div class="text-center">
        <img class="mx-auto h-16 w-auto" src="/logo.png" alt="World View Logo" />
        <h2 class="mt-6 text-center text-4xl font-gloock font-bold text-color-heading">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-color-text">
          Or
          <router-link to="/inscription" class="font-medium text-color-primary hover:text-color-primary-accent">
            create a new account
          </router-link>
        </p>
      </div>
      <form class="mt-8 space-y-6 bg-color-surface p-8 rounded-lg shadow-lg border border-color-border" @submit="login">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input id="email-address" v-model="email" name="email" type="email" autocomplete="email" required class="appearance-none rounded-md relative block w-full px-4 py-3 border border-color-border bg-color-bg placeholder-gray-500 text-color-text focus:outline-none focus:ring-color-primary focus:border-color-primary focus:z-10 sm:text-sm" placeholder="Email address">
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input id="password" v-model="password" name="password" type="password" autocomplete="current-password" required class="appearance-none rounded-md relative block w-full px-4 py-3 border border-color-border bg-color-bg placeholder-gray-500 text-color-text focus:outline-none focus:ring-color-primary focus:border-color-primary focus:z-10 sm:text-sm" placeholder="Password">
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>

        <div>
          <button type="submit" class="group relative w-full flex justify-center btn-primary">
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
