<script setup>
import AppImage from '../common/AppImage.vue'
import { resolveImage } from '../../utils/media'

const props = defineProps({
    actor: { type: Object, required: true },
})

const fullName = () => `${props.actor.firstname ?? ''} ${props.actor.lastname ?? ''}`.trim()
</script>

<template>
    <article class="universal-card group h-full cursor-pointer">
        <div class="relative">
            <AppImage
                :src="resolveImage(actor)"
                :alt="`Portrait de ${fullName()}`"
                fallback="/placeholder-person.svg"
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
                    {{ actor.firstname }}
                </h3>
                <p class="display-condensed text-sm text-[#FFD700]">
                    {{ actor.lastname }}
                </p>
            </div>
        </div>
    </article>
</template>
