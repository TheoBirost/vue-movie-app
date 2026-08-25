<script setup>
import { useRouter } from 'vue-router'
import AppImage from '../common/AppImage.vue'
import { resolveImage } from '../../utils/media'

const props = defineProps({
    director: { type: Object, required: true },
})

const router = useRouter()

const fullName = () =>
    `${props.director.firstname ?? ''} ${props.director.lastname ?? ''}`.trim()

const open = () => router.push(`/directors/${props.director.id}`)
</script>

<template>
    <article
        class="universal-card group h-full cursor-pointer"
        tabindex="0"
        role="link"
        :aria-label="`Voir la fiche de ${fullName()}`"
        @click="open"
        @keydown.enter="open"
        @keydown.space.prevent="open"
    >
        <div class="relative">
            <AppImage
                :src="resolveImage(director)"
                :alt="`Portrait de ${fullName()}`"
                kind="person"
                :fallback-seed="director.id"
                :fallback-label="fullName()"
                img-class="h-72 transition-transform duration-700 group-hover:scale-[1.06]"
                class="h-72 w-full"
            />

            <div
                class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent"
                aria-hidden="true"
            />

            <div class="absolute inset-x-0 bottom-0 p-5">
                <h3
                    class="garamond text-2xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-[#FFD700]"
                >
                    {{ director.firstname }}
                </h3>
                <p class="display-condensed text-sm text-[#FFD700]">
                    {{ director.lastname }}
                </p>
            </div>
        </div>
    </article>
</template>
