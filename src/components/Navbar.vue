<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const props = defineProps({
  loggedIn: Boolean,
  photo: String
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
  { name: 'Catégories', href: '/categories' },
]
</script>

<template>
  <nav class="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex justify-between items-center h-16">

        <!-- Logo -->
        <router-link to="/home" class="flex items-center gap-3 group">
          <img class="h-10 w-10 transition-transform duration-200 group-hover:scale-105" src="/public/logo.png" alt="Logo">
          <span class="font-semibold text-xl text-gray-900">Movie's</span>
        </router-link>

        <div class="hidden md:flex items-center gap-2">
          <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
              active-class="text-gray-900 bg-gray-100"
          >
            {{ item.name }}
          </router-link>
        </div>

        <div class="hidden md:flex items-center gap-3">
          <router-link
              to="/profile"
              class="transition-transform duration-200 hover:scale-105"
          >
            <img
                :src="props.photo || 'https://placehold.co/36x36'"
                alt="Profile"
                class="w-9 h-9 rounded-full ring-2 ring-gray-200 hover:ring-gray-300 transition-all"
            />
          </router-link>

          <button
              v-if="props.loggedIn"
              @click="logout"
              class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-95"
              title="Déconnexion"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 17 5-5-5-5"/>
              <path d="M21 12H9"/>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            </svg>
          </button>
        </div>

        <button
            @click="toggleMenu"
            class="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
        >
          <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isOpen" class="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
        <div class="px-4 py-4 space-y-1">
          <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              active-class="text-gray-900 bg-gray-100"
              @click="isOpen = false"
          >
            {{ item.name }}
          </router-link>

          <router-link
              to="/profile"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              @click="isOpen = false"
          >
            <img
                :src="photo"
                alt="Profile"
                class="w-9 h-9 rounded-full ring-2 ring-gray-200 hover:ring-gray-300 transition-all"
            />
            <span>Profil</span>
          </router-link>

          <button
              v-if="props.loggedIn"
              @click="logout"
              class="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 17 5-5-5-5"/>
              <path d="M21 12H9"/>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </transition>
  </nav>
</template>