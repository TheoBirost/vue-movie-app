<script setup>
const emit = defineEmits(['cancel', 'confirm'])
const props = defineProps({ category: Object })
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50" @click.self="emit('cancel')">
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-8 w-full max-w-md shadow-2xl">
      <h3 class="text-2xl font-bold text-white mb-4">
        Confirmer la suppression
      </h3>

      <p class="text-[var(--text-gray)] mb-6">
        Êtes-vous sûr de vouloir supprimer
        <span class="text-white font-semibold">{{ props.category?.name }}</span> ?
        Cette action est irréversible.
      </p>

      <div class="flex gap-3">
        <button
            @click="emit('cancel')"
            class="flex-1 px-4 py-3 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-gray)] rounded-lg transition font-medium"
        >
          Annuler
        </button>
        <button
            @click="emit('confirm')"
            :disabled="props.category?.moviesCount > 0"
            class="flex-1 px-4 py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>