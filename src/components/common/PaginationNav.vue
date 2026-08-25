<script setup>
const props = defineProps({
    modelValue: { type: Number, required: true },
    totalPages: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue'])

const go = (page) => {
    const next = Math.min(props.totalPages, Math.max(1, page))
    if (next !== props.modelValue) emit('update:modelValue', next)
}
</script>

<template>
    <nav
        v-if="totalPages > 1"
        class="flex items-center justify-center gap-6 pt-8"
        aria-label="Pagination"
    >
        <button
            type="button"
            class="nav-btn"
            :disabled="modelValue === 1"
            aria-label="Page précédente"
            @click="go(modelValue - 1)"
        >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>

        <p class="text-sm tracking-[0.2em] text-[#C1C1C7]" role="status" aria-live="polite">
            PAGE <span class="font-bold text-[#FFD700]">{{ modelValue }}</span> / {{ totalPages }}
        </p>

        <button
            type="button"
            class="nav-btn"
            :disabled="modelValue === totalPages"
            aria-label="Page suivante"
            @click="go(modelValue + 1)"
        >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    </nav>
</template>

<style scoped>
.nav-btn {
    display: flex;
    height: 3rem;
    width: 3rem;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    border: 1px solid var(--color-line);
    background-color: var(--color-surface);
    color: var(--color-chalk);
    transition:
        border-color var(--duration-base) var(--ease-cinema),
        transform var(--duration-fast) var(--ease-cinema);
}
.nav-btn:hover:not(:disabled) {
    border-color: var(--color-gold);
    transform: translateY(-2px);
}
.nav-btn:active:not(:disabled) {
    transform: scale(0.94);
}
.nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}
</style>
