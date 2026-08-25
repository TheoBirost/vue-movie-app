<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '../../stores/useDataStore'
import { useMotionPreference } from '../../composables/useMotion'
import { applySeo } from '../../composables/useSeo'
import api from '../../api/api.js'
import MovieCard from '../../components/domain/MovieCard.vue'
import PageHeader from '../../components/common/PageHeader.vue'
import SearchField from '../../components/common/SearchField.vue'
import PaginationNav from '../../components/common/PaginationNav.vue'
import CardSkeletonGrid from '../../components/common/CardSkeletonGrid.vue'
import EmptyState from '../../components/common/EmptyState.vue'

const PER_PAGE = 12
const SEARCH_DEBOUNCE_MS = 400

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()
const reduced = useMotionPreference()

const search = ref(typeof route.query.search === 'string' ? route.query.search : '')
const page = ref(Number(route.query.page) || 1)
const loading = ref(true)
const movies = ref([])
const totalItems = ref(0)
const categoryName = ref('')
const grid = ref(null)

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / PER_PAGE)))

/**
 * Une requête par frappe saturait le limiteur de l'API (5 requêtes/minute pour
 * un visiteur anonyme) : taper « Matrix » suffisait à déclencher un 429.
 * On attend donc une pause de saisie, et on annule la requête précédente.
 */
let debounceId = null
let controller = null

const fetchMovies = async () => {
    controller?.abort()
    controller = new AbortController()
    loading.value = true

    try {
        const params = {
            page: page.value,
            itemsPerPage: PER_PAGE,
            'groups[]': ['movie:read', 'movie:categories'],
        }

        if (route.query.category) params['categories.id'] = route.query.category
        if (search.value.trim()) params.name = search.value.trim()

        const { data } = await api.get('/movies', { params, signal: controller.signal })

        movies.value = data['hydra:member'] ?? data.member ?? []
        totalItems.value = data['hydra:totalItems'] ?? data.totalItems ?? movies.value.length

        await nextTick()
        revealCards()
    } catch (error) {
        // Une requête annulée n'est pas une erreur : la suivante est déjà partie
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return
        movies.value = []
        totalItems.value = 0
    } finally {
        if (!controller?.signal.aborted) loading.value = false
    }
}

const fetchCategoryName = async () => {
    if (!route.query.category) {
        categoryName.value = ''
        return
    }
    // Le nom vient du store quand il est déjà chargé, sinon une requête ciblée
    const cached = dataStore.categories.find((c) => String(c.id) === String(route.query.category))
    if (cached) {
        categoryName.value = cached.name
        return
    }
    try {
        const { data } = await api.get(`/categories/${route.query.category}`)
        categoryName.value = data.name ?? ''
    } catch {
        categoryName.value = ''
    }
}

/** Entrée en cascade des cartes, sans jamais les rendre invisibles au départ. */
const revealCards = () => {
    if (reduced.value || !grid.value) return
    grid.value.querySelectorAll('[data-card]').forEach((card, index) => {
        card.style.animation = `fade-up 520ms var(--ease-cinema) ${Math.min(index, 8) * 55}ms both`
    })
}

const heading = computed(() =>
    categoryName.value ? `Films — ${categoryName.value}` : 'Films'
)

/** Garde l'URL en phase avec l'état : la recherche devient partageable. */
const syncUrl = () => {
    const query = { ...route.query }

    if (search.value.trim()) query.search = search.value.trim()
    else delete query.search

    if (page.value > 1) query.page = String(page.value)
    else delete query.page

    router.replace({ query })
}

watch(search, () => {
    page.value = 1
    clearTimeout(debounceId)
    debounceId = setTimeout(() => {
        syncUrl()
        fetchMovies()
    }, SEARCH_DEBOUNCE_MS)
})

watch(page, () => {
    syncUrl()
    fetchMovies()
    window.scrollTo({ top: 0, behavior: reduced.value ? 'auto' : 'smooth' })
})

watch(
    () => route.query.category,
    async () => {
        page.value = 1
        await fetchCategoryName()
        applySeo({
            title: heading.value,
            description: `Films du catalogue${categoryName.value ? ` — genre ${categoryName.value}` : ''}.`,
            path: route.path,
        })
        fetchMovies()
    }
)

onMounted(async () => {
    // Les catégories alimentent les puces des cartes
    dataStore.fetchCategories().catch(() => {})
    await fetchCategoryName()
    if (categoryName.value) {
        applySeo({
            title: heading.value,
            description: `Films du catalogue — genre ${categoryName.value}.`,
            path: route.path,
        })
    }
    await fetchMovies()
})

onUnmounted(() => {
    clearTimeout(debounceId)
    controller?.abort()
})
</script>

<template>
    <div class="min-h-screen bg-[#0d0d0f]">
        <div class="mx-auto max-w-7xl space-y-12 px-6 py-20 md:py-28">
            <PageHeader
                eyebrow="Collection"
                :title="heading"
                :subtitle="
                    totalItems
                        ? `${totalItems} film${totalItems > 1 ? 's' : ''} au catalogue`
                        : ''
                "
            />

            <SearchField
                id="movie-search"
                v-model="search"
                label="Rechercher un film"
                placeholder="Rechercher un film…"
                :result-count="loading ? null : totalItems"
            />

            <CardSkeletonGrid
                v-if="loading"
                :count="8"
                media-class="h-64"
                label="Chargement des films"
            />

            <div
                v-else-if="movies.length"
                ref="grid"
                class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
                <div
                    v-for="movie in movies"
                    :key="movie.id"
                    data-card
                    @click="router.push(`/movies/${movie.id}`)"
                >
                    <MovieCard :movie="movie" />
                </div>
            </div>

            <EmptyState v-else message="Aucun film ne correspond à cette recherche.">
                <template #action>
                    <button
                        v-if="search || categoryName"
                        type="button"
                        class="btn btn-secondary"
                        @click="
                            search = '';
                            router.push('/movies')
                        "
                    >
                        Voir tous les films
                    </button>
                </template>
            </EmptyState>

            <PaginationNav v-model="page" :total-pages="totalPages" />
        </div>
    </div>
</template>
