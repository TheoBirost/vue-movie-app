<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useDataStore } from '../../stores/useDataStore'
import { useMotionPreference } from '../../composables/useMotion'
import { normalize } from '../../utils/text'
import DirectorCard from '../../components/domain/DirectorCard.vue'
import ParticleField from '../../components/common/ParticleField.vue'
import PageHeader from '../../components/common/PageHeader.vue'
import SearchField from '../../components/common/SearchField.vue'
import PaginationNav from '../../components/common/PaginationNav.vue'
import CardSkeletonGrid from '../../components/common/CardSkeletonGrid.vue'
import EmptyState from '../../components/common/EmptyState.vue'

const PER_PAGE = 12

const dataStore = useDataStore()
const reduced = useMotionPreference()

const search = ref('')
const page = ref(1)
const loading = ref(true)
const errorMessage = ref('')
const grid = ref(null)

const filtered = computed(() => {
    const needle = normalize(search.value.trim())
    if (!needle) return dataStore.directors
    return dataStore.directors.filter((director) =>
        `${normalize(director.firstname)} ${normalize(director.lastname)}`.includes(needle)
    )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))

const paginated = computed(() =>
    filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE)
)

const revealCards = () => {
    if (reduced.value || !grid.value) return
    grid.value.querySelectorAll('[data-card]').forEach((card, index) => {
        card.style.animation = `fade-up 520ms var(--ease-cinema) ${Math.min(index, 8) * 55}ms both`
    })
}

watch(search, () => {
    page.value = 1
})

watch([page, filtered], async () => {
    await nextTick()
    revealCards()
})

onMounted(async () => {
    try {
        await dataStore.fetchDirectors()
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
    <div class="relative min-h-screen bg-[#0d0d0f]">
        <!-- Brume dorée : décor discret, monté seulement hors « mouvement réduit » -->
        <div class="pointer-events-none fixed inset-0 opacity-40" aria-hidden="true">
            <ParticleField position="fixed" :count="200" :size="1.1" :speed="0.16" :opacity="0.5" />
        </div>

        <div class="relative z-10 mx-auto max-w-7xl space-y-12 px-6 py-20 md:py-28">
            <PageHeader
                eyebrow="Maestros"
                title="Réalisateurs"
                :subtitle="
                    dataStore.directors.length
                        ? `${dataStore.directors.length} cinéastes au catalogue`
                        : ''
                "
            />

            <SearchField
                id="director-search"
                v-model="search"
                label="Rechercher un réalisateur"
                placeholder="Rechercher un réalisateur…"
                :result-count="loading ? null : filtered.length"
            />

            <CardSkeletonGrid
                v-if="loading"
                :count="8"
                media-class="h-72"
                label="Chargement des réalisateurs"
            />

            <div
                v-else-if="paginated.length"
                ref="grid"
                class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
                <div v-for="director in paginated" :key="director.id" data-card>
                    <DirectorCard :director="director" />
                </div>
            </div>

            <EmptyState
                v-else
                :message="errorMessage || 'Aucun réalisateur ne correspond à cette recherche.'"
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
