<script setup>

</script>

<template>
  <nav class="bg-gray-800 text-white p-4 flex justify-between items-center">
    <div class="flex space-x-4">
      <router-link to="/" class="hover:text-gray-300">Home</router-link>
      <router-link to="/movies" class="hover:text-gray-300">Movies</router-link>
      <router-link to="/actors" class="hover:text-gray-300">Actors</router-link>
      <router-link to="/categories" class="hover:text-gray-300">Categories</router-link>
    </div>

    <div class="flex items-center space-x-4">
      <router-link to="/profile" class="hover:text-gray-300">
        <img src="https://via.placeholder.com/30" alt="PP" class="rounded-full">
      </router-link>
      <!--<button class="bg-red-600 px-3 py-1 rounded hover:bg-red-500">Logout</button>-->
    </div>
  </nav>
</template>


<style scoped>

</style>
