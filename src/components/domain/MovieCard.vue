<script setup>
import { computed } from 'vue'
import AppImage from '../common/AppImage.vue'
import { useDataStore } from '../../stores/useDataStore'
import { resolveImage } from '../../utils/media'

const props = defineProps({
    movie: { type: Object, required: true },
})

const dataStore = useDataStore()

const categories = computed(() => {
    if (!props.movie.categories?.length) return []
    return props.movie.categories
        .map((iri) => dataStore.categories.find((c) => `/api/categories/${c.id}` === iri))
        .filter(Boolean)
})

const SHORT_NAMES = {
    Documentaire: 'Docu',
    'Science-Fiction': 'SF',
    Biographie: 'Bio',
}

const year = computed(() => {
    const date = new Date(props.movie.releaseDate)
    return props.movie.releaseDate && !isNaN(date) ? date.getFullYear() : '—'
})

const shortName = (name) => SHORT_NAMES[name] || name
</script>

<template>
    <article class="universal-card group h-full cursor-pointer">
        <div class="relative">
            <AppImage
                :src="resolveImage(movie)"
                :alt="`Affiche du film ${movie.name}`"
                kind="poster"
                :fallback-seed="movie.id"
                :fallback-label="movie.name"
                img-class="h-64 transition-transform duration-700 group-hover:scale-[1.06]"
                class="h-64 w-full"
            />

            <!-- Dégradé de pied d'affiche : garde le badge lisible sur les images claires -->
            <div
                class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#16181E] via-[#16181E]/60 to-transparent"
                aria-hidden="true"
            />

            <span
                class="absolute right-3 top-3 rounded bg-black/65 px-2.5 py-1 text-xs font-semibold tracking-wider text-[#FFD700] backdrop-blur-sm"
            >
                {{ year }}
            </span>
        </div>

        <div class="p-5">
            <h3
                class="garamond line-clamp-2 text-xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-[#FFD700]"
            >
                {{ movie.name }}
            </h3>

            <div v-if="categories.length" class="mt-3 flex flex-wrap gap-2">
                <span
                    v-for="category in categories.slice(0, 3)"
                    :key="category.id"
                    class="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-[#C1C1C7]"
                >
                    {{ shortName(category.name) }}
                </span>
                <span
                    v-if="categories.length > 3"
                    class="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-[#82828A]"
                >
                    +{{ categories.length - 3 }}
                </span>
            </div>
        </div>
    </article>
</template>
