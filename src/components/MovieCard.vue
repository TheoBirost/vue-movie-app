<script setup>
defineProps({
  movie: { type: Object, required: true }
})
const getYear = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date)) return '—'
  return date.getFullYear()
}
</script>

<template>
  <div class="group cursor-pointer">
    <div class="relative overflow-hidden rounded-2xl bg-gray-100 mb-3">
      <img
          :src="movie.url ? movie.url : '/default-film.jpeg'"
          :alt="movie.name"
          class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
    </div>

    <div class="px-1">
      <h3 class="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
        {{ movie.name }}
      </h3>

      <p class="text-lg text-gray-600 mb-6">
        Sortie du film en  {{ getYear(movie.releaseDate) }}
      </p>
    </div>
  </div>
</template>