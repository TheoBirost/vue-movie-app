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
  <div class="group cursor-pointer">
    <div class="bg-[var(--bg-card)] rounded-[var(--radius)] overflow-hidden border border-[var(--border)] hover:border-[var(--gold)] transition-colors">

      <div class="relative w-full h-64 overflow-hidden">
        <img
            :src="movie.url ? movie.url : '/default-film.jpeg'"
            :alt="movie.name"
            class="w-full h-full object-cover"
        />

        <div class="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-semibold text-[var(--gold)]">
          {{ getYear(movie.releaseDate) }}
        </div>
      </div>

      <div class="p-4 space-y-3">
        <h3 class="text-white font-semibold line-clamp-2 leading-tight">
          {{ movie.name }}
        </h3>

        <div class="flex flex-wrap gap-2">
          <span
              v-for="category in movie.categories?.slice(0, 3)"
              :key="category.id"
              class="px-2 py-1 text-xs bg-[var(--bg-hover)] border border-[var(--border)] rounded text-[var(--text-gray)]"
          >
            {{ category.name }}
          </span>
          <span
              v-if="movie.categories?.length > 3"
              class="px-2 py-1 text-xs bg-[var(--bg-hover)] border border-[var(--border)] rounded text-[var(--text-gray)]"
          >
            +{{ movie.categories.length - 2 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>