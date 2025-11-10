<script setup>
const emit = defineEmits(['cancel', 'confirm'])
const props = defineProps({ user: Object })
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50" @click.self="emit('cancel')">
    <div class="bg-white/95 backdrop-blur-xl p-8 rounded-3xl w-full max-w-sm shadow-2xl">
      <h3 class="text-xl font-semibold mb-3 text-gray-900">
       Supprimer "{{ props.user?.firstname }} {{ props.user?.lastname }}" ?
      </h3>

      <p class="text-gray-500 mb-8 text-sm leading-relaxed">
        Cette action est irréversible et supprimera définitivement votre compte.
      </p>

      <div class="flex flex-col gap-3">
        <button
            @click="emit('confirm')"
            class="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl transition-all duration-200 active:scale-95"
        >
          Supprimer
        </button>

        <button
            @click="emit('cancel')"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 rounded-xl transition-all duration-200 active:scale-95"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>