<script setup>
defineProps({
  movie: { type: Object, required: true }
})
</script>

<template>
  <div class="cursor-pointer bg-white shadow rounded-xl p-3 hover:shadow-lg transition">
    <img
        :src="movie.image?.url || '/img/default-movie.jpg'"
        :alt="movie.name"
        class="rounded-lg w-full h-48 object-cover"
    />
    <h3 class="mt-2 font-semibold text-center">{{ movie.name }}</h3>
    <p v-if="movie.releaseDate" class="text-sm text-gray-500 text-center">
      Sortie : {{ new Date(movie.releaseDate).toLocaleDateString() }}
    </p>
  </div>
</template>
