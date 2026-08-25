<script setup>
defineProps({
    /** Nombre de cartes fantômes à afficher. */
    count: { type: Number, default: 8 },
    /** Hauteur du visuel, alignée sur la carte réelle (h-64 films, h-72 personnes). */
    mediaClass: { type: String, default: 'h-64' },
    label: { type: String, default: 'Chargement du contenu' },
})
</script>

<template>
    <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        role="status"
        :aria-label="label"
    >
        <div
            v-for="n in count"
            :key="n"
            class="overflow-hidden rounded-[6px] border border-[#2A2D36] bg-[#16181E]"
        >
            <div class="skeleton rounded-none border-0" :class="mediaClass" />
            <div class="space-y-3 p-5">
                <div class="skeleton h-5 w-4/5 rounded border-0" />
                <div class="flex gap-2">
                    <div class="skeleton h-6 w-14 rounded border-0" />
                    <div class="skeleton h-6 w-10 rounded border-0" />
                </div>
            </div>
        </div>
        <span class="sr-only">{{ label }}…</span>
    </div>
</template>
