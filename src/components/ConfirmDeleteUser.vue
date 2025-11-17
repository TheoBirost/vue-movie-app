<script setup>
const emit = defineEmits(['cancel', 'confirm'])
const props = defineProps({ user: Object })
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50" @click.self="emit('cancel')">
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-8 w-full max-w-md shadow-2xl">
      <h3 class="text-2xl font-bold text-white mb-4">
        Confirmer la suppression
      </h3>

      <p class="text-[var(--text-gray)] mb-6">
        Êtes-vous sûr de vouloir supprimer le compte de
        <span class="text-white font-semibold">{{ props.user?.firstname }} {{ props.user?.lastname }}</span> ?
        Cette action est irréversible et supprimera définitivement votre compte.
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
            class="flex-1 px-4 py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 rounded-lg transition font-medium"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>