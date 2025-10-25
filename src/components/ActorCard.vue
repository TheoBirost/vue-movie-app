<script setup>
defineProps({
  actor: { type: Object, required: true }
})
</script>

<template>
  <div class="cursor-pointer bg-white shadow rounded-xl p-3 hover:shadow-lg transition">
    <img
        :src="actor.photo?.url || '/img/default-actor.jpg'"
        :alt="actor.firstname + ' ' + actor.lastname"
        class="rounded-lg w-full h-48 object-cover"
    />
    <h3 class="mt-2 font-semibold text-center">
      {{ actor.firstname }} {{ actor.lastname }}
    </h3>
  </div>
</template>
