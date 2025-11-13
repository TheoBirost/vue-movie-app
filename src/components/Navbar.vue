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
  <nav class="sticky top-0 z-50 bg-[var(--bg-main)] border-b border-[var(--border)]">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <router-link to="/home" class="flex items-center gap-3">
          <img class="h-10 w-10" src="/public/logo.png" alt="Logo">
          <span class="text-2xl font-bold text-[var(--gold)]">Movie's</span>
        </router-link>

        <!-- Navigation Desktop -->
        <div class="hidden md:flex items-center gap-8">
          <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="text-sm text-[var(--text-gray)] hover:text-[var(--gold)] transition-colors"
              active-class="text-[var(--gold)]"
          >
            {{ item.name }}
          </router-link>
        </div>

        <!-- Actions Desktop -->
        <div class="hidden md:flex items-center gap-4">
          <router-link to="/profile">
            <img
                :src="props.photo || 'https://placehold.co/40x40?text=👤&bg=1a1a1a&fg=d4af37'"
                alt="Profile"
                class="w-10 h-10 rounded-full border border-[var(--border)] hover:border-[var(--gold)] transition-colors"
            />
          </router-link>

          <button
              v-if="props.loggedIn"
              @click="logout"
              class="p-2 text-[var(--text-gray)] hover:text-[var(--gold)] transition-colors"
              title="Déconnexion"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 17 5-5-5-5"/>
              <path d="M21 12H9"/>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            </svg>
          </button>
        </div>

        <!-- Menu Mobile Button -->
        <button @click="toggleMenu" class="md:hidden text-[var(--text-gray)]">
          <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Navigation Mobile -->
      <div v-if="isOpen" class="md:hidden pb-4 space-y-2 border-t border-[var(--border)] pt-4">
        <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            @click="isOpen = false"
            class="block px-4 py-2 text-sm text-[var(--text-gray)] hover:text-[var(--gold)] transition-colors"
            active-class="text-[var(--gold)]"
        >
          {{ item.name }}
        </router-link>

        <div class="flex items-center gap-4 px-4 pt-4 border-t border-[var(--border)] mt-4">
          <router-link to="/profile" @click="isOpen = false">
            <img
                :src="props.photo || 'https://placehold.co/40x40?text=👤&bg=1a1a1a&fg=d4af37'"
                alt="Profile"
                class="w-10 h-10 rounded-full border border-[var(--border)]"
            />
          </router-link>

          <button
              v-if="props.loggedIn"
              @click="logout"
              class="text-sm text-[var(--text-gray)] hover:text-[var(--gold)] flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 17 5-5-5-5"/>
              <path d="M21 12H9"/>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>