<script setup>
defineProps({
  actor: { type: Object, required: true }
})
</script>

<template>
  <div class="group cursor-pointer">
    <div class="bg-[var(--bg-card)] rounded-[var(--radius)] overflow-hidden border border-[var(--border)] hover:border-[var(--gold)] transition-colors">

      <div class="relative w-full h-64 overflow-hidden">
        <img
            :src="actor.url || '/img/default-actor.jpg'"
            :alt="`${actor.firstname} ${actor.lastname}`"
            class="w-full h-full object-cover"
        />
      </div>

      <div class="p-4 space-y-1">
        <h3 class="text-white font-semibold">
          {{ actor.firstname }}
        </h3>
        <p class="text-sm text-[var(--text-gray)] uppercase tracking-wide">
          {{ actor.lastname }}
        </p>
      </div>
    </div>
  </div>
</template>