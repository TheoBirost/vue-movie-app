<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import { useRoute } from 'vue-router'

const loggedIn = ref(false)

onMounted(() => {
  // Vérifie si l'utilisateur est déjà connecté
  loggedIn.value = localStorage.getItem('loggedIn') === 'true'
})

const handleLogin = () => {
  loggedIn.value = true
}

const handleLogout = () => {
  loggedIn.value = false
  localStorage.removeItem('loggedIn') // supprime la session
}

const route = useRoute()
const showNavbar = computed(() => !route.meta.hideNavbar)

</script>

<template>

  <Navbar v-if="showNavbar" :logged-in="loggedIn" @logout="handleLogout" />

  <router-view @login-success="handleLogin" />

</template>
