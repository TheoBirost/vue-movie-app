<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../../stores/useDataStore'
import { useMotionPreference } from '../../composables/useMotion'
import ActorCard from '../../components/domain/ActorCard.vue'
import PageHeader from '../../components/common/PageHeader.vue'
import SearchField from '../../components/common/SearchField.vue'
import PaginationNav from '../../components/common/PaginationNav.vue'
import CardSkeletonGrid from '../../components/common/CardSkeletonGrid.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { normalize } from '../../utils/text'

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
    if (!needle) return dataStore.actors
    return dataStore.actors.filter((actor) =>
        `${normalize(actor.firstname)} ${normalize(actor.lastname)}`.includes(needle)
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
        await dataStore.fetchActors()
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
                eyebrow="Talents"
                title="Acteurs"
                :subtitle="
                    dataStore.actors.length
                        ? `${dataStore.actors.length} interprètes au catalogue`
                        : ''
                "
            />

            <SearchField
                id="actor-search"
                v-model="search"
                label="Rechercher un acteur"
                placeholder="Rechercher un acteur…"
                :result-count="loading ? null : filtered.length"
            />

            <CardSkeletonGrid
                v-if="loading"
                :count="8"
                media-class="h-72"
                label="Chargement des acteurs"
            />

            <div
                v-else-if="paginated.length"
                ref="grid"
                class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
                <div
                    v-for="actor in paginated"
                    :key="actor.id"
                    data-card
                    @click="router.push(`/actors/${actor.id}`)"
                >
                    <ActorCard :actor="actor" />
                </div>
            </div>

            <EmptyState
                v-else
                :message="errorMessage || 'Aucun acteur ne correspond à cette recherche.'"
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
