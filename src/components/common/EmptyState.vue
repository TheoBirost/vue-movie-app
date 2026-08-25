<script setup>
defineProps({
    message: { type: String, required: true },
})
</script>

<template>
    <div class="py-20 text-center">
        <div class="mb-6 inline-block rounded-full bg-[#16181E] p-6">
            <svg
                class="h-12 w-12 text-[#FFD700]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
            </svg>
        </div>
        <p class="text-lg text-[#C1C1C7]">{{ message }}</p>
        <div class="mt-6 flex justify-center">
            <slot name="action" />
        </div>
    </div>
</template>
