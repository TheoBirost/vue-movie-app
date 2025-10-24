<script setup>
import { ref } from 'vue'
import { defineEmits, defineProps } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  loggedIn: Boolean
})

const emit = defineEmits(['logout'])
const router = useRouter()
const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const logout = () => {
  emit('logout')
  localStorage.removeItem('loggedIn')
  router.push('/')
}

const navigation = [
  { name: 'Accueil', href: '/home' },
  { name: 'Films', href: '/movies' },
  { name: 'Acteurs', href: '/actors' },
  { name: 'Categories', href: '/categories' },
]
</script>

<template>
  <nav class="bg-white ">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">

        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <img class="h-12 w-12" src="/public/logo.png" alt="Logo">
          <span class="font-bold text-2xl text-gray-800">Movie's</span>
        </router-link>

        <!-- Menu desktop -->
        <div class="hidden md:flex space-x-6 font-semibold text-gray-700">
          <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            {{ item.name }}
          </router-link>
        </div>

        <!-- Profil / bouton -->
        <div class="hidden md:flex items-center space-x-4">
          <router-link to="/profile">
            <img src="https://placehold.co/40x40" alt="PP" class="rounded-full " />
          </router-link>
          <button
              v-if="props.loggedIn"
              @click="logout"
              class="bg-red-500 text-white px-2 py-2 rounded-lg hover:bg-red-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out-icon lucide-log-out"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
          </button>
        </div>

        <!-- Hamburger mobile -->
        <button @click="toggleMenu" class="md:hidden focus:outline-none">
          <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Menu mobile -->
    <div v-if="isOpen" class="md:hidden bg-white shadow-md">
      <div class="px-4 pt-4 pb-2 space-y-2">
        <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="block px-4 py-2 rounded hover:bg-gray-100 transition"
        >
          {{ item.name }}
        </router-link>
        <router-link to="/profile" class="block px-4 py-2 rounded hover:bg-gray-100 transition">
          Profile
        </router-link>
        <button
            v-if="props.loggedIn"
            @click="logout"
            class="w-full text-left px-4 py-2 rounded hover:bg-red-100 text-red-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out-icon lucide-log-out"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
</style>
