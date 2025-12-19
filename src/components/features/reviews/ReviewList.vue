<template>
  <div class="mt-8">
    <h2 class="text-2xl font-bold mb-4">Reviews</h2>
    <div v-if="reviews.length > 0">
      <div v-for="review in reviews" :key="review.id" class="bg-gray-800 p-4 rounded-lg mb-4">
        <div class="flex items-center mb-2">
          <p class="font-bold">{{ review.user.firstname }} {{ review.user.lastname }}</p>
          <div class="flex ml-4">
            <span v-for="n in 5" :key="n" class="text-yellow-500">
              {{ n <= review.rating ? '★' : '☆' }}
            </span>
          </div>
        </div>
        <p>{{ review.comment }}</p>
      </div>
    </div>
    <div v-else>
      <p>No reviews yet.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reviews: {
    type: Array,
    required: true,
  },
});
</script>
