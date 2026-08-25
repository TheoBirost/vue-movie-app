<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../../stores/useDataStore'
import { useMotionPreference } from '../../composables/useMotion'
import { normalize } from '../../utils/text'
import PageHeader from '../../components/common/PageHeader.vue'
import SearchField from '../../components/common/SearchField.vue'
import PaginationNav from '../../components/common/PaginationNav.vue'
import EmptyState from '../../components/common/EmptyState.vue'

const PER_PAGE = 12

const router = useRouter()
const dataStore = useDataStore()
const reduced = useMotionPreference()

const search = ref('')
const page = ref(1)
const loading = ref(true)
const errorMessage = ref('')
const grid = ref(null)

const filtered = computed(() => {
    const needle = normalize(search.value.trim())
    if (!needle) return dataStore.categories
    return dataStore.categories.filter((category) =>
        normalize(category.name).includes(needle)
    )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))

const paginated = computed(() =>
    filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE)
)

const revealCards = () => {
    if (reduced.value || !grid.value) return
    grid.value.querySelectorAll('[data-card]').forEach((card, index) => {
        card.style.animation = `fade-up 480ms var(--ease-cinema) ${Math.min(index, 8) * 45}ms both`
    })
}

const openCategory = (id) => router.push(`/movies?category=${id}`)

watch(search, () => {
    page.value = 1
})

watch([page, filtered], async () => {
    await nextTick()
    revealCards()
})

onMounted(async () => {
    try {
        await dataStore.fetchCategories()
    } catch (error) {
        errorMessage.value = error.response
            ? `Le serveur a répondu ${error.response.status}.`
            : "Impossible de joindre le serveur pour l'instant."
    } finally {
        loading.value = false
        await nextTick()
        revealCards()
    }
})
</script>

<template>
    <div class="min-h-screen bg-[#0d0d0f]">
        <div class="mx-auto max-w-7xl space-y-12 px-6 py-20 md:py-28">
            <PageHeader
                eyebrow="Genres"
                title="Catégories"
                subtitle="Choisissez un genre pour filtrer le catalogue de films."
            />

            <SearchField
                id="category-search"
                v-model="search"
                label="Rechercher une catégorie"
                placeholder="Rechercher une catégorie…"
                :result-count="loading ? null : filtered.length"
            />

            <!-- Squelettes calqués sur la vraie tuile : pas de saut de mise en page -->
            <div
                v-if="loading"
                class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                role="status"
                aria-label="Chargement des catégories"
            >
                <div v-for="n in 8" :key="n" class="skeleton h-28 rounded-[6px]" />
            </div>

            <div
                v-else-if="paginated.length"
                ref="grid"
                class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
                <button
                    v-for="category in paginated"
                    :key="category.id"
                    data-card
                    type="button"
                    class="category-tile group text-left"
                    @click="openCategory(category.id)"
                >
                    <h2
                        class="garamond text-2xl font-bold text-white transition-colors group-hover:text-[#FFD700]"
                    >
                        {{ category.name }}
                    </h2>
                    <p class="mt-1 text-sm text-[#82828A]">
                        {{ category.moviesCount || 0 }} film{{
                            (category.moviesCount || 0) > 1 ? 's' : ''
                        }}
                    </p>
                    <span
                        class="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.15em] text-[#FFD700] opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                    >
                        VOIR LES FILMS →
                    </span>
                </button>
            </div>

            <EmptyState
                v-else
                :message="errorMessage || 'Aucune catégorie ne correspond à cette recherche.'"
            >
                <template #action>
                    <button
                        v-if="search"
                        type="button"
                        class="btn btn-secondary"
                        @click="search = ''"
                    >
                        Réinitialiser la recherche
                    </button>
                </template>
            </EmptyState>

            <PaginationNav v-model="page" :total-pages="totalPages" />
        </div>
    </div>
</template>

<style scoped>
.category-tile {
    display: block;
    padding: 1.5rem;
    border-radius: var(--radius-card);
    border: 1px solid var(--color-line);
    background-color: var(--color-surface);
    transition:
        border-color var(--duration-base) var(--ease-cinema),
        transform var(--duration-base) var(--ease-cinema),
        box-shadow var(--duration-base) var(--ease-cinema);
}

.category-tile:hover,
.category-tile:focus-visible {
    border-color: rgb(255 215 0 / 0.4);
    transform: translateY(-4px);
    box-shadow: var(--shadow-lift);
}

@media (prefers-reduced-motion: reduce) {
    .category-tile:hover,
    .category-tile:focus-visible {
        transform: none;
    }
}
</style>
