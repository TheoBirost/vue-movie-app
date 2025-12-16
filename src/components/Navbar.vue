<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { bus } from '../bus'

const props = defineProps({
  loggedIn: Boolean,
  photo: String
})

const emit = defineEmits(['logout'])
const router = useRouter()
const isOpen = ref(false)
const isScrolled = ref(false)

const rateLimit = ref({ remaining: null, limit: null })

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const logout = () => {
  emit('logout')
  localStorage.removeItem('token')
  localStorage.removeItem('loggedIn')
  localStorage.removeItem('role')
  localStorage.removeItem('userPhoto')
  router.push('/connexion')
}

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Films', href: '/movies' },
  { name: 'Acteurs', href: '/actors' },
  { name: 'Réalisateurs', href: '/directors' }, // Nouveau lien
  { name: 'Catégories', href: '/categories' },
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const updateRateLimit = (data) => {
  rateLimit.value = data
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  bus.on('rate-limit-update', updateRateLimit)
  gsap.from('.nav-item', {
    opacity: 0,
    y: -20,
    duration: 0.5,
    stagger: 0.1,
    delay: 1.5,
    ease: 'power3.out'
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  bus.off('rate-limit-update', updateRateLimit)
})
</script>

<template>
  <nav
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled || isOpen ? 'bg-[#0d0d0f]/80 backdrop-blur-lg border-b border-[#2A2D36]' : 'bg-transparent'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-24">
        <div class="flex items-center">
          <router-link to="/" class="flex-shrink-0 flex items-center gap-3">
            <span class="garamond text-3xl font-bold text-[#FFD700]">Cinéaste</span>
          </router-link>
        </div>

        <div class="hidden md:flex items-center space-x-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="nav-item px-4 py-2 rounded-md text-sm font-medium text-[#C1C1C7] hover:text-white hover:bg-white/5 transition-colors"
            active-class="text-white bg-white/10"
          >
            {{ item.name }}
          </router-link>
        </div>

        <div class="hidden md:flex items-center gap-4">
          <template v-if="props.loggedIn">
            <div v-if="rateLimit.remaining !== null" class="nav-item text-xs text-[#82828A] flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
              <span>{{ rateLimit.remaining }} / {{ rateLimit.limit }}</span>
            </div>
            <button
              @click="logout"
              class="nav-item p-2 rounded-full text-[#C1C1C7] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
            </button>
            <router-link to="/profile" class="nav-item">
              <img
                class="h-10 w-10 rounded-full object-cover border-2 border-[#2A2D36] hover:border-[#FFD700] transition"
                :src="props.photo"
                alt="Photo de profil"
              />
            </router-link>
          </template>
          <template v-else>
            <router-link to="/connexion" class="nav-item px-6 py-2.5 rounded-lg text-sm font-bold text-[#FFD700] border border-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-colors">
              Connexion
            </router-link>
          </template>
        </div>

        <div class="-mr-2 flex md:hidden">
          <button
            @click="toggleMenu"
            class="inline-flex items-center justify-center p-2 rounded-md text-[#C1C1C7] hover:text-white hover:bg-white/10 focus:outline-none"
          >
            <svg class="h-6 w-6" :class="{'hidden': isOpen, 'block': !isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg class="h-6 w-6" :class="{'hidden': !isOpen, 'block': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="isOpen" class="md:hidden border-t border-[#2A2D36]">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            @click="isOpen = false"
            class="block px-3 py-2 rounded-md text-base font-medium text-[#C1C1C7] hover:text-white hover:bg-white/5"
            active-class="text-white bg-white/10"
          >
            {{ item.name }}
          </router-link>
        </div>
        <div class="pt-4 pb-3 border-t border-[#2A2D36]">
          <div class="flex items-center px-5">
            <template v-if="props.loggedIn">
              <router-link to="/profile" @click="isOpen = false" class="flex-shrink-0">
                <img class="h-10 w-10 rounded-full object-cover" :src="props.photo" alt="Photo de profil" />
              </router-link>
              <div class="ml-auto">
                <button
                  @click="logout"
                  class="p-2 rounded-full text-[#C1C1C7] hover:text-white hover:bg-white/10"
                  aria-label="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
                </button>
              </div>
            </template>
            <template v-else>
              <router-link to="/connexion" @click="isOpen = false" class="w-full text-center px-6 py-2.5 rounded-lg text-sm font-bold text-[#FFD700] border border-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-colors">
                Connexion
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>
