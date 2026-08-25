<script setup>
const year = new Date().getFullYear()

const columns = [
    {
        title: 'Explorer',
        links: [
            { label: 'Films', to: '/movies' },
            { label: 'Acteurs', to: '/actors' },
            { label: 'Réalisateurs', to: '/directors' },
            { label: 'Catégories', to: '/categories' },
        ],
    },
    {
        title: 'Compte',
        links: [
            { label: 'Connexion', to: '/connexion' },
            { label: 'Créer un compte', to: '/inscription' },
            { label: 'Mon profil', to: '/profile' },
        ],
    },
    {
        title: 'Informations',
        links: [
            { label: 'Mentions légales', to: '/mentions-legales' },
            { label: 'Politique de confidentialité', to: '/confidentialite' },
        ],
    },
]
</script>

<template>
    <footer class="border-t border-[#2A2D36] bg-[#0d0d0f]">
        <div class="mx-auto max-w-7xl px-6 py-16">
            <div class="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
                <div>
                    <router-link
                        to="/"
                        class="garamond text-3xl font-bold text-[#FFD700]"
                        aria-label="Cinéaste, retour à l'accueil"
                    >
                        Cinéaste
                    </router-link>
                    <p class="mt-4 max-w-xs text-sm leading-relaxed text-[#82828A]">
                        Une collection de films, d'acteurs et de réalisateurs, tenue
                        à jour par sa communauté.
                    </p>
                </div>

                <nav
                    v-for="column in columns"
                    :key="column.title"
                    :aria-label="column.title"
                >
                    <h2 class="display-condensed mb-4 text-xs text-[#F5F5F7]">
                        {{ column.title }}
                    </h2>
                    <ul class="space-y-2.5">
                        <li v-for="link in column.links" :key="link.to">
                            <router-link
                                :to="link.to"
                                class="text-sm text-[#82828A] transition-colors hover:text-[#FFD700]"
                            >
                                {{ link.label }}
                            </router-link>
                        </li>
                    </ul>
                </nav>
            </div>

            <div
                class="mt-14 flex flex-col gap-3 border-t border-[#2A2D36] pt-8 text-xs text-[#82828A] sm:flex-row sm:items-center sm:justify-between"
            >
                <p>© {{ year }} Cinéaste. Projet étudiant — données de démonstration.</p>
                <p>
                    Réalisé avec Vue 3, Symfony et API Platform.
                </p>
            </div>
        </div>
    </footer>
</template>
