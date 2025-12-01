<script setup>
defineProps({
  movie: { type: Object, required: true }
});

const getYear = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date)) return '—';
  return date.getFullYear();
};
</script>

<template>
  <div class="group cursor-pointer overflow-hidden rounded-lg bg-color-surface shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up">
    <div class="relative w-full h-72">
      <img
        :src="movie.url ? movie.url : '/default-film.jpg'"
        :alt="movie.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div class="absolute top-4 right-4 px-3 py-1 bg-color-primary/80 backdrop-blur-sm rounded-full text-xs font-bold text-white">
        {{ getYear(movie.releaseDate) }}
      </div>
    </div>
    <div class="p-5">
      <h3 class="text-xl font-gloock font-bold text-color-heading truncate mb-2">
        {{ movie.name }}
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="category in movie.categories?.slice(0, 2)"
          :key="category.id"
          class="px-3 py-1 text-xs font-medium bg-color-bg text-color-text rounded-full border border-color-border"
        >
          {{ category.name }}
        </span>
        <span
          v-if="movie.categories?.length > 2"
          class="px-3 py-1 text-xs font-medium bg-color-bg text-color-text rounded-full border border-color-border"
        >
          +{{ movie.categories.length - 2 }}
        </span>
      </div>
    </div>
  </div>
</template>
