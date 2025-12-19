<template>
  <div class="mt-8">
    <h2 class="text-2xl font-bold mb-4">Leave a Review</h2>
    <form @submit.prevent="submitReview">
      <div class="mb-4">
        <label for="rating" class="block mb-2">Rating</label>
        <div class="flex">
          <span
            v-for="n in 5"
            :key="n"
            @click="rating = n"
            class="text-2xl cursor-pointer"
            :class="{ 'text-yellow-500': n <= rating, 'text-gray-400': n > rating }"
          >
            ★
          </span>
        </div>
      </div>
      <div class="mb-4">
        <label for="comment" class="block mb-2">Comment</label>
        <textarea
          id="comment"
          v-model="comment"
          class="w-full p-2 rounded-lg bg-gray-800"
          rows="4"
        ></textarea>
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Submit Review</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '/src/api/api.js';

const props = defineProps({
  movieId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['review-submitted']);

const rating = ref(0);
const comment = ref('');

const submitReview = async () => {
  try {
    await api.post('/reviews', {
      rating: rating.value,
      comment: comment.value,
      movie: `/api/movies/${props.movieId}`,
    });
    emit('review-submitted');
    rating.value = 0;
    comment.value = '';
  } catch (error) {
    console.error('Error submitting review:', error);
  }
};
</script>
