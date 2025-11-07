<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import { useRoute } from 'vue-router'
import api from '/src/api/api.js'

const loggedIn = ref(false)
const photo = ref('/default-avatar.png')

onMounted(async () => {
  loggedIn.value = localStorage.getItem('loggedIn') === 'true'

  if (loggedIn.value) {
    const cachedPhoto = localStorage.getItem('userPhoto')
    if (cachedPhoto) {
      photo.value = cachedPhoto
    } else {
      try {
        const res = await api.get(import.meta.env.VITE_API_URL_USER)
        const baseUrl = import.meta.env.VITE_API_BASE_URL
        photo.value = res.data.photo
            ? `${baseUrl}${res.data.photo}`
            : '/default-avatar.png'

        localStorage.setItem('userPhoto', photo.value)
      } catch {
        photo.value = '/default-avatar.png'
      }
    }
  }
})

const handleLogin = (newPhoto) => {
  loggedIn.value = true
  photo.value = newPhoto || '/default-avatar.png'
}

const handleLogout = () => {
  loggedIn.value = false
  localStorage.removeItem('loggedIn')
  localStorage.removeItem('userPhoto')
  photo.value = '/default-avatar.png'
}

const route = useRoute()
const showNavbar = computed(() => !route.meta.hideNavbar)
</script>

<template>
  <Navbar
      v-if="showNavbar"
      :logged-in="loggedIn"
      :photo="photo"
      @logout="handleLogout"
  />
  <router-view @login-success="handleLogin" />
</template>
