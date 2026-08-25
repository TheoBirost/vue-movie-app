<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: { type: String, default: '' },
    id: { type: String, required: true },
    label: { type: String, required: true },
    placeholder: { type: String, default: 'Rechercher…' },
    /** Nombre de résultats, annoncé aux lecteurs d'écran. */
    resultCount: { type: Number, default: null },
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
    get: () => props.modelValue,
    set: (next) => emit('update:modelValue', next),
})
</script>

<template>
    <div class="relative">
        <label :for="id" class="sr-only">{{ label }}</label>
        <input
            :id="id"
            v-model="value"
            type="search"
            :placeholder="placeholder"
            class="field py-4 pl-6 pr-14 text-lg"
            autocomplete="off"
        />

        <svg
            class="pointer-events-none absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#FFD700]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>

        <!-- Le nombre de résultats est annoncé sans voler le focus -->
        <p v-if="resultCount !== null" class="sr-only" role="status" aria-live="polite">
            {{ resultCount }} résultat{{ resultCount > 1 ? 's' : '' }}
        </p>
    </div>
</template>
