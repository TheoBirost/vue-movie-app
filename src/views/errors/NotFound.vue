<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const suggestions = [
    { label: 'Films', to: '/movies', hint: 'Tout le catalogue' },
    { label: 'Acteurs', to: '/actors', hint: 'Les interprètes' },
    { label: 'Réalisateurs', to: '/directors', hint: 'Les cinéastes' },
    { label: 'Catégories', to: '/categories', hint: 'Par genre' },
]
</script>

<template>
    <div class="flex min-h-screen items-center bg-[#0d0d0f] px-6 py-24">
        <div class="mx-auto w-full max-w-3xl text-center">
            <p class="eyebrow mb-4">Erreur 404</p>

            <p class="error-code garamond text-[9rem] font-bold leading-none text-[#FFD700] md:text-[12rem]">
                404
            </p>

            <h1 class="garamond mt-2 text-4xl font-bold text-white md:text-5xl">
                Cette séance n'existe pas
            </h1>
            <p class="mx-auto mt-4 max-w-lg text-[#C1C1C7]">
                La page que vous cherchez a été déplacée, supprimée, ou n'a jamais
                été tournée.
            </p>

            <div class="mt-10 flex flex-wrap justify-center gap-4">
                <router-link to="/" class="btn btn-primary">Retour à l'accueil</router-link>
                <button type="button" class="btn btn-ghost" @click="router.back()">
                    Page précédente
                </button>
            </div>

            <div class="section-rule my-12" />

            <nav aria-label="Suggestions de navigation">
                <p class="mb-5 text-sm text-[#82828A]">Ou repartez d'ici :</p>
                <ul class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <li v-for="link in suggestions" :key="link.to">
                        <router-link
                            :to="link.to"
                            class="block rounded-[6px] border border-[#2A2D36] bg-[#16181E] px-4 py-4 transition-colors hover:border-[#FFD700]"
                        >
                            <span class="block text-sm font-semibold text-white">
                                {{ link.label }}
                            </span>
                            <span class="mt-0.5 block text-xs text-[#82828A]">
                                {{ link.hint }}
                            </span>
                        </router-link>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<style scoped>
.error-code {
    /* Reflet doré qui balaie lentement le nombre */
    background: linear-gradient(
        100deg,
        var(--color-gold-dark) 20%,
        var(--color-gold-light) 45%,
        var(--color-gold-dark) 70%
    );
    background-size: 250% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: sweep 5s var(--ease-cinema) infinite;
}

@keyframes sweep {
    0%, 100% { background-position: 180% 0; }
    50%      { background-position: -60% 0; }
}

@media (prefers-reduced-motion: reduce) {
    .error-code {
        animation: none;
        background: none;
        color: var(--color-gold);
    }
}
</style>
