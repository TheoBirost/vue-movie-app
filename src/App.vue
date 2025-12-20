<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Navbar from './components/common/Navbar.vue'
import ErrorDisplay from './components/common/ErrorDisplay.vue'
import { useRoute } from 'vue-router'
import api from '/src/api/api.js'
import { gsap } from 'gsap'

const loggedIn = ref(false)
const photo = ref('/default-avatar.png')

// Curseur personnalisé
onMounted(async () => {
  loggedIn.value = localStorage.getItem('loggedIn') === 'true'

  const cursorDot = document.querySelector('.cursor-dot')
  const cursorRing = document.querySelector('.cursor-ring')

  const handleMouseMove = (e) => {
    gsap.to(cursorDot, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: 'power2.out'
    })
    gsap.to(cursorRing, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.4,
      ease: 'power3.out'
    })
  }

  const handleMouseOver = (e) => {
    if (e.target.closest('a, button, .movie-card, .actor-card')) {
      gsap.to(cursorRing, {
        scale: 1.5,
        borderColor: '#FFD700',
        duration: 0.3
      })
    }
  }

  const handleMouseOut = (e) => {
    if (e.target.closest('a, button, .movie-card, .actor-card')) {
      gsap.to(cursorRing, {
        scale: 1,
        borderColor: '#C1C1C7',
        duration: 0.3
      })
    }
  }

  // Only add custom cursor on non-touch devices
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver, true)
    document.addEventListener('mouseout', handleMouseOut, true)
  }

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
  <div class="cursor-dot" />
  <div class="cursor-ring" />

  <ErrorDisplay />
  <header v-if="showNavbar">
    <Navbar
        :logged-in="loggedIn"
        :photo="photo"
        @logout="handleLogout"
    />
  </header>
  <main>
    <router-view @login-success="handleLogin" />
  </main>
</template>

<style>
.cursor-dot {
  position: fixed;
  top: -5px;
  left: -5px;
  width: 10px;
  height: 10px;
  background-color: #FFD700;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
}

.cursor-ring {
  position: fixed;
  top: -20px;
  left: -20px;
  width: 40px;
  height: 40px;
  border: 2px solid #C1C1C7;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transition: border-color 0.3s, transform 0.3s;
  mix-blend-mode: difference;
}

@media (max-width: 768px) {
  .cursor-dot, .cursor-ring {
    display: none;
  }
}
</style>
