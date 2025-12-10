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
    <div class="relative overflow-hidden rounded-lg bg-[#16181E] border border-[#2A2D36] hover:border-[#FFD700] transition-all duration-500 hover:transform hover:scale-[1.02]">

      <div class="relative w-full h-64 overflow-hidden">
        <img
            :src="movie.url ? movie.url : '/default-film.jpeg'"
            :alt="movie.name"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <!-- Overlay gradient -->
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60" />

        <!-- Badge année -->
        <div class="absolute top-3 right-3 px-3 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-semibold text-[#FFD700] tracking-wider">
          {{ getYear(movie.releaseDate) }}
        </div>

        <!-- Titre en overlay -->
        <div class="absolute bottom-0 left-0 right-0 p-5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <h3 class="text-white font-bold text-lg leading-tight line-clamp-2">
            {{ movie.name }}
          </h3>
        </div>
      </div>

      <div class="p-5 space-y-3">
        <h3 class="text-white font-semibold line-clamp-2 leading-tight group-hover:text-[#FFD700] transition-colors">
          {{ movie.name }}
        </h3>

        <div class="flex flex-wrap gap-2">
          <span
              v-for="category in movie.categories?.slice(0, 2)"
              :key="category.id"
              class="px-2 py-1 text-xs bg-[#1E2129] border border-[#2A2D36] rounded text-[#C1C1C7] hover:border-[#FFD700] hover:text-[#FFD700] transition-colors"
          >
            {{ category.name }}
          </span>
          <span
              v-if="movie.categories?.length > 2"
              class="px-2 py-1 text-xs bg-[#1E2129] border border-[#2A2D36] rounded text-[#C1C1C7]"
          >
            +{{ movie.categories.length - 2 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>