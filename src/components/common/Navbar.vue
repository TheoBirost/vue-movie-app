<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { bus } from '../../bus'
import { readSession, clearSession } from '../../auth/session'

const props = defineProps({
    loggedIn: Boolean,
    photo: String,
})

const emit = defineEmits(['logout'])

const router = useRouter()
const route = useRoute()

const isOpen = ref(false)
const isScrolled = ref(false)
const rateLimit = ref({ remaining: null, limit: null })

const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Films', href: '/movies' },
    { name: 'Acteurs', href: '/actors' },
    { name: 'Réalisateurs', href: '/directors' },
    { name: 'Catégories', href: '/categories' },
]

// L'entrée Admin suit le rôle porté par le jeton, pas un drapeau localStorage
const isAdmin = computed(() => props.loggedIn && readSession().isAdmin)

const logout = () => {
    emit('logout')
    clearSession()
    router.push('/connexion')
}

const handleScroll = () => {
    isScrolled.value = window.scrollY > 10
}

const updateRateLimit = (data) => {
    rateLimit.value = data
}

// Ferme le menu mobile à la navigation et à l'échappement
watch(() => route.fullPath, () => (isOpen.value = false))

const onKeydown = (event) => {
    if (event.key === 'Escape') isOpen.value = false
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', onKeydown)
    bus.on('rate-limit-update', updateRateLimit)
    handleScroll()
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('keydown', onKeydown)
    bus.off('rate-limit-update', updateRateLimit)
})
</script>

<template>
    <nav
        class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
        :class="
            isScrolled || isOpen
                ? 'border-b border-[#2A2D36] bg-[#0d0d0f]/85 backdrop-blur-lg'
                : 'border-b border-transparent bg-transparent'
        "
        aria-label="Navigation principale"
    >
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex h-24 items-center justify-between">
                <router-link
                    to="/"
                    class="garamond flex-shrink-0 text-3xl font-bold text-[#FFD700]"
                    aria-label="Cinéaste, retour à l'accueil"
                >
                    Cinéaste
                </router-link>

                <!-- Navigation bureau -->
                <div class="hidden items-center gap-1 md:flex">
                    <router-link
                        v-for="item in navigation"
                        :key="item.href"
                        :to="item.href"
                        class="nav-link"
                        active-class="is-active"
                        :aria-current="route.path === item.href ? 'page' : undefined"
                    >
                        {{ item.name }}
                    </router-link>
                    <router-link
                        v-if="isAdmin"
                        to="/admin"
                        class="nav-link"
                        active-class="is-active"
                    >
                        Admin
                    </router-link>
                </div>

                <div class="hidden items-center gap-4 md:flex">
                    <template v-if="props.loggedIn">
                        <p
                            v-if="rateLimit.remaining !== null"
                            class="flex items-center gap-1 text-xs text-[#82828A]"
                            :title="`Requêtes API restantes sur la minute en cours`"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                            <span>{{ rateLimit.remaining }} / {{ rateLimit.limit }}</span>
                        </p>

                        <button
                            type="button"
                            class="icon-btn inline-flex items-center justify-center"
                            aria-label="Se déconnecter"
                            @click="logout"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m16 17 5-5-5-5" />
                                <path d="M21 12H9" />
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            </svg>
                        </button>

                        <router-link to="/profile" aria-label="Mon profil">
                            <img
                                class="h-10 w-10 rounded-full border-2 border-[#2A2D36] object-cover transition-colors hover:border-[#FFD700]"
                                :src="props.photo"
                                alt=""
                                width="40"
                                height="40"
                            />
                        </router-link>
                    </template>

                    <router-link v-else to="/connexion" class="btn btn-secondary">
                        Connexion
                    </router-link>
                </div>

                <!-- Bouton menu mobile -->
                <button
                    type="button"
                    class="icon-btn -mr-2 inline-flex items-center justify-center md:hidden"
                    :aria-expanded="isOpen"
                    aria-controls="menu-mobile"
                    :aria-label="isOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
                    @click="isOpen = !isOpen"
                >
                    <svg
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                    >
                        <path
                            v-if="!isOpen"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                        <path
                            v-else
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="-translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-2 opacity-0"
        >
            <div v-if="isOpen" id="menu-mobile" class="border-t border-[#2A2D36] md:hidden">
                <div class="space-y-1 px-4 py-3">
                    <router-link
                        v-for="item in navigation"
                        :key="item.href"
                        :to="item.href"
                        class="block rounded-md px-3 py-2.5 text-base font-medium text-[#C1C1C7] hover:bg-white/5 hover:text-white"
                        active-class="bg-white/10 text-white"
                    >
                        {{ item.name }}
                    </router-link>
                    <router-link
                        v-if="isAdmin"
                        to="/admin"
                        class="block rounded-md px-3 py-2.5 text-base font-medium text-[#C1C1C7] hover:bg-white/5 hover:text-white"
                        active-class="bg-white/10 text-white"
                    >
                        Admin
                    </router-link>
                </div>

                <div class="border-t border-[#2A2D36] px-4 py-4">
                    <div v-if="props.loggedIn" class="flex items-center justify-between">
                        <router-link
                            to="/profile"
                            class="flex items-center gap-3 text-[#C1C1C7]"
                        >
                            <img
                                class="h-10 w-10 rounded-full object-cover"
                                :src="props.photo"
                                alt=""
                                width="40"
                                height="40"
                            />
                            <span class="text-sm font-medium">Mon profil</span>
                        </router-link>
                        <button
                            type="button"
                            class="icon-btn inline-flex items-center justify-center"
                            aria-label="Se déconnecter"
                            @click="logout"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m16 17 5-5-5-5" />
                                <path d="M21 12H9" />
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            </svg>
                        </button>
                    </div>

                    <router-link v-else to="/connexion" class="btn btn-secondary w-full">
                        Connexion
                    </router-link>
                </div>
            </div>
        </Transition>
    </nav>
</template>

<style scoped>
.nav-link {
    position: relative;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-ash);
    transition: color var(--duration-base) var(--ease-cinema);
}

.nav-link:hover {
    color: var(--color-chalk);
}

/* Soulignement doré qui se déploie depuis le centre */
.nav-link::after {
    content: '';
    position: absolute;
    left: 1rem;
    right: 1rem;
    bottom: 0.15rem;
    height: 1px;
    background-color: var(--color-gold);
    transform: scaleX(0);
    transition: transform var(--duration-base) var(--ease-cinema);
}

.nav-link:hover::after,
.nav-link.is-active::after {
    transform: scaleX(1);
}

.nav-link.is-active {
    color: var(--color-chalk);
}

/*
 * Pas de `display` ici : une règle de <style scoped> est injectée après la
 * feuille Tailwind et l'emporterait sur `md:hidden`, laissant le bouton
 * hamburger visible en bureau. La mise en flex passe donc par les classes
 * utilitaires sur l'élément.
 */
.icon-btn {
    padding: 0.5rem;
    border-radius: 9999px;
    color: var(--color-ash);
    transition:
        color var(--duration-base) var(--ease-cinema),
        background-color var(--duration-base) var(--ease-cinema);
}

.icon-btn:hover {
    color: var(--color-chalk);
    background-color: rgb(255 255 255 / 0.08);
}
</style>
