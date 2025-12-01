<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'

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
  { name: 'Home', href: '/home' },
  { name: 'Movies', href: '/movies' },
  { name: 'Actors', href: '/actors' },
  { name: 'Categories', href: '/categories' },
]
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-color-surface/80 backdrop-blur-md border-b border-color-border transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <div class="flex items-center">
          <router-link to="/home" class="flex-shrink-0 flex items-center gap-2">
            <img class="h-10 w-auto" src="/logo.png" alt="World View Logo" />
            <span class="text-2xl font-bold font-gloock text-color-heading">World View</span>
          </router-link>
        </div>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="px-3 py-2 rounded-md text-sm font-medium text-color-text hover:text-color-primary transition-colors"
              active-class="text-color-primary"
            >
              {{ item.name }}
            </router-link>
          </div>
        </div>
        <div class="hidden md:block">
          <div class="ml-4 flex items-center md:ml-6">
            <ThemeToggle />
            <button
              v-if="props.loggedIn"
              @click="logout"
              class="ml-4 p-2 rounded-full btn-secondary"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
            </button>
            <div class="ml-3 relative">
              <router-link to="/profile">
                <img
                  class="h-10 w-10 rounded-full object-cover border-2 border-transparent hover:border-color-primary transition"
                  :src="props.photo"
                  alt="User profile"
                />
              </router-link>
            </div>
          </div>
        </div>
        <div class="-mr-2 flex md:hidden">
          <ThemeToggle />
          <button
            @click="toggleMenu"
            class="ml-2 inline-flex items-center justify-center p-2 rounded-md btn-secondary"
          >
            <svg class="h-6 w-6" :class="{'hidden': isOpen, 'block': !isOpen }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg class="h-6 w-6" :class="{'hidden': !isOpen, 'block': isOpen }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isOpen" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          @click="isOpen = false"
          class="block px-3 py-2 rounded-md text-base font-medium text-color-text hover:text-color-primary"
          active-class="text-color-primary"
        >
          {{ item.name }}
        </router-link>
      </div>
      <div class="pt-4 pb-3 border-t border-color-border">
        <div class="flex items-center px-5">
          <router-link to="/profile" @click="isOpen = false" class="flex-shrink-0">
            <img class="h-10 w-10 rounded-full object-cover" :src="props.photo" alt="User profile" />
          </router-link>
          <div class="ml-auto">
            <button
              v-if="props.loggedIn"
              @click="logout"
              class="p-2 rounded-full btn-secondary"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
