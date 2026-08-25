<script setup>
defineProps({
    eyebrow: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
})
</script>

<template>
    <header class="page-header">
        <p class="eyebrow mb-2">{{ eyebrow }}</p>
        <h1 class="garamond mb-3 text-6xl font-bold text-white md:text-7xl">
            {{ title }}
        </h1>
        <div class="h-1 w-24 bg-gradient-to-r from-[#FFD700] to-transparent" />
        <p v-if="subtitle" class="mt-4 max-w-2xl text-[#C1C1C7]">{{ subtitle }}</p>
    </header>
</template>
