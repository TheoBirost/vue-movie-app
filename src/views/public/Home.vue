<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../../stores/useDataStore'
import { useMotionPreference } from '../../composables/useMotion'
import { applyJsonLd, SITE_URL } from '../../composables/useSeo'
import MovieCard from '../../components/domain/MovieCard.vue'
import ActorCard from '../../components/domain/ActorCard.vue'
import ParticleField from '../../components/common/ParticleField.vue'
import CardSkeletonGrid from '../../components/common/CardSkeletonGrid.vue'

const router = useRouter()
const dataStore = useDataStore()
const reduced = useMotionPreference()

const loading = ref(true)
const root = ref(null)

const movies = computed(() => dataStore.movies.slice(0, 4))
const actors = computed(() => dataStore.actors.slice(0, 4))

const goToMovie = (id) => router.push(`/movies/${id}`)
const goToActor = (id) => router.push(`/actors/${id}`)

/**
 * Révélation au scroll en IntersectionObserver.
 *
 * Le contenu est visible par défaut dans le HTML ; l'observateur ne fait
 * qu'ajouter une animation d'entrée. Une animation ratée ou interrompue ne
 * peut donc pas laisser une section bloquée à `opacity: 0` — c'était le risque
 * de l'approche `gsap.from(..., { opacity: 0 })` précédente.
 */
let observer = null

const observeReveals = () => {
    if (reduced.value || typeof IntersectionObserver === 'undefined') return
    observer?.disconnect()

    const targets = root.value?.querySelectorAll('[data-reveal]') ?? []
    if (!targets.length) return

    observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return
                const delay = Number(entry.target.dataset.reveal) * 90
                entry.target.style.animation = `fade-up 620ms var(--ease-cinema) ${delay}ms both`
                observer.unobserve(entry.target)
            })
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    )

    targets.forEach((el) => observer.observe(el))
}

onMounted(async () => {
    applyJsonLd({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Cinéaste',
        url: SITE_URL,
        inLanguage: 'fr-FR',
        potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/movies?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    })

    try {
        // Les catégories alimentent les puces des cartes de films
        await Promise.all([
            dataStore.fetchMovies(),
            dataStore.fetchActors(),
            dataStore.fetchCategories(),
        ])
    } catch {
        // L'intercepteur API affiche déjà l'erreur ; on retire juste le squelette
    } finally {
        loading.value = false
        await nextTick()
        observeReveals()
    }
})
</script>

<template>
    <div ref="root" class="relative min-h-screen overflow-hidden bg-[#0d0d0f]">
        <!-- Héros -->
        <section
            class="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
            aria-labelledby="hero-title"
        >
            <ParticleField :count="340" :size="1.8" :speed="0.3" />

            <div
                class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05),transparent_65%)]"
                aria-hidden="true"
            />
            <div
                class="absolute inset-0 bg-gradient-to-b from-[#0d0d0f]/70 via-transparent to-[#0d0d0f]"
                aria-hidden="true"
            />

            <div class="relative z-10 mx-auto max-w-5xl px-6 text-center">
                <p
                    class="hero-badge mb-8 inline-block rounded-full border border-[#FFD700]/30 px-6 py-2 text-[10px] tracking-[0.25em] text-[#FFD700]"
                >
                    PREMIUM FILM COLLECTION
                </p>

                <h1
                    id="hero-title"
                    class="hero-title garamond mb-6 text-7xl font-bold leading-none text-[#FFD700] md:text-9xl"
                >
                    CINÉASTE
                </h1>

                <p
                    class="hero-subtitle mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-white/70 md:text-xl"
                >
                    Explorez une collection exclusive de films et d'acteurs légendaires
                </p>

                <div class="flex flex-wrap justify-center gap-4">
                    <router-link to="/movies" class="hero-cta btn btn-primary">
                        Explorer les films
                    </router-link>
                    <router-link to="/actors" class="hero-cta btn btn-secondary">
                        Découvrir les acteurs
                    </router-link>
                </div>
            </div>

            <!-- Indicateur de défilement -->
            <div
                v-if="!reduced"
                class="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
                aria-hidden="true"
            >
                <span class="scroll-hint block h-10 w-[1px] bg-gradient-to-b from-[#FFD700] to-transparent" />
            </div>
        </section>

        <!-- Contenu — pb supplémentaire sous la barre d'action mobile -->
        <div class="mx-auto max-w-7xl space-y-24 px-6 pb-40 pt-24 md:pb-24">
            <!-- Films -->
            <section aria-labelledby="latest-movies" class="space-y-8">
                <div data-reveal="0" class="flex items-end justify-between gap-6">
                    <div>
                        <p class="eyebrow mb-2">Sélection</p>
                        <h2
                            id="latest-movies"
                            class="garamond text-5xl font-bold text-white md:text-6xl"
                        >
                            Derniers films
                        </h2>
                    </div>
                    <router-link
                        to="/movies"
                        class="flex-shrink-0 text-sm tracking-[0.15em] text-[#FFD700] transition-colors hover:text-[#FFE55C]"
                    >
                        VOIR TOUT →
                    </router-link>
                </div>

                <div data-reveal="1" class="section-rule" />

                <CardSkeletonGrid
                    v-if="loading"
                    :count="4"
                    media-class="h-64"
                    label="Chargement des films"
                />
                <p v-else-if="!movies.length" class="py-12 text-center text-white/60">
                    Aucun film trouvé.
                </p>
                <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div
                        v-for="(movie, index) in movies"
                        :key="movie.id"
                        :data-reveal="index"
                        @click="goToMovie(movie.id)"
                    >
                        <MovieCard :movie="movie" />
                    </div>
                </div>
            </section>

            <!-- Acteurs -->
            <section aria-labelledby="legendary-actors" class="space-y-8">
                <div data-reveal="0" class="flex items-end justify-between gap-6">
                    <div>
                        <p class="eyebrow mb-2">Talents</p>
                        <h2
                            id="legendary-actors"
                            class="garamond text-5xl font-bold text-white md:text-6xl"
                        >
                            Acteurs légendaires
                        </h2>
                    </div>
                    <router-link
                        to="/actors"
                        class="flex-shrink-0 text-sm tracking-[0.15em] text-[#FFD700] transition-colors hover:text-[#FFE55C]"
                    >
                        VOIR TOUT →
                    </router-link>
                </div>

                <div data-reveal="1" class="section-rule" />

                <CardSkeletonGrid
                    v-if="loading"
                    :count="4"
                    media-class="h-72"
                    label="Chargement des acteurs"
                />
                <p v-else-if="!actors.length" class="py-12 text-center text-white/60">
                    Aucun acteur trouvé.
                </p>
                <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div
                        v-for="(actor, index) in actors"
                        :key="actor.id"
                        :data-reveal="index"
                        @click="goToActor(actor.id)"
                    >
                        <ActorCard :actor="actor" />
                    </div>
                </div>
            </section>
        </div>

        <!--
          Action principale toujours atteignable au pouce sur mobile.

          Téléportée vers <body>, tout en restant écrite ici : la vue est
          enveloppée par la transition de page, qui applique un `transform` le
          temps du fondu. Un enfant `position: fixed` se positionnerait alors
          par rapport à la vue et non par rapport à l'écran — la barre
          sauterait à chaque navigation. Le <Teleport> reste à l'intérieur de
          la racine pour que la vue conserve un élément racine unique, ce
          qu'exige le <Transition> de App.vue.
        -->
        <Teleport to="body">
            <div class="sticky-cta">
                <router-link to="/movies" class="btn btn-primary flex-1">
                    Explorer
                </router-link>
                <router-link to="/actors" class="btn btn-secondary flex-1">
                    Acteurs
                </router-link>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
/*
 * Intro du héros en CSS : une timeline GSAP pour quatre fondus enchaînés ne
 * justifiait pas de charger 28 ko gzip sur la page d'accueil. `both` conserve
 * l'état final ; la règle `prefers-reduced-motion` globale neutralise le tout.
 */
.hero-badge,
.hero-title,
.hero-subtitle,
.hero-cta {
    animation: fade-up 800ms var(--ease-cinema) both;
}
.hero-badge    { animation-delay: 150ms; }
.hero-title    { animation-delay: 300ms; }
.hero-subtitle { animation-delay: 480ms; }
.hero-cta:nth-of-type(1) { animation-delay: 620ms; }
.hero-cta:nth-of-type(2) { animation-delay: 720ms; }

.scroll-hint {
    animation: scroll-hint 2.2s var(--ease-cinema) infinite;
    transform-origin: top;
}

@keyframes scroll-hint {
    0%, 100% { transform: scaleY(0.35); opacity: 0.35; }
    50%      { transform: scaleY(1); opacity: 1; }
}

</style>
