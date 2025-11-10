<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import { useRoute } from 'vue-router'
import api from '/src/api/api.js'

const loggedIn = ref(false)
const photo = ref('http://localhost:8319/media/images/default-avatar-690e4f3d71cc3431908037.jpg')

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
            : 'http://localhost:8319/media/images/default-avatar-690e4f3d71cc3431908037.jpg'

        localStorage.setItem('userPhoto', photo.value)
      } catch {
        photo.value = 'http://localhost:8319/media/images/default-avatar-690e4f3d71cc3431908037.jpg'
      }
    }
  }
})

const handleLogin = (newPhoto) => {
  loggedIn.value = true
  photo.value = newPhoto || 'http://localhost:8319/media/images/default-avatar-690e4f3d71cc3431908037.jpg'
}

const handleLogout = () => {
  loggedIn.value = false
  localStorage.removeItem('loggedIn')
  localStorage.removeItem('userPhoto')
  photo.value = 'http://localhost:8319/media/images/default-avatar-690e4f3d71cc3431908037.jpg'
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
