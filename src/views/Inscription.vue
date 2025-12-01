<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const apiPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Accept': 'application/ld+json'
  }
})

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const password = ref('')
const dob = ref('')
const photoFile = ref(null)
const photoPreview = ref(null)
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    photoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => photoPreview.value = e.target.result
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  const fileInput = document.getElementById('photo')
  if (fileInput) fileInput.value = ''
}

const uploadPhoto = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiPublic.post('/media_objects.jsonld', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return `/api/media_objects/${response.data.id}`
}

const register = async (e) => {
  e.preventDefault()
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    let photoIri = null
    if (photoFile.value) photoIri = await uploadPhoto(photoFile.value)

    const userData = {
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      plainPassword: password.value,
      dob: dob.value,
    }
    if (photoIri) userData.photo = photoIri

    await apiPublic.post(import.meta.env.VITE_API_URL_REGISTER, userData, {
      headers: { 'Content-Type': 'application/ld+json' }
    })

    successMessage.value = 'Account created successfully! Redirecting...'
    setTimeout(() => router.push('/'), 2000)
  } catch (error) {
    errorMessage.value =
        error.response?.data?.message ||
        error.response?.data?.['hydra:description'] ||
        error.response?.data?.detail ||
        (error.response?.status === 500
            ? "An error occurred. The email may already be in use."
            : error.message) ||
        "An error occurred during registration."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-color-bg flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
    <div class="w-full max-w-lg space-y-8" data-aos="fade-up">
      <div class="text-center">
        <img class="mx-auto h-16 w-auto" src="/logo.png" alt="World View Logo" />
        <h2 class="mt-6 text-center text-4xl font-gloock font-bold text-color-heading">
          Create a new account
        </h2>
        <p class="mt-2 text-center text-sm text-color-text">
          Already have an account?
          <router-link to="/" class="font-medium text-color-primary hover:text-color-primary-accent">
            Sign in
          </router-link>
        </p>
      </div>
      <form class="mt-8 space-y-6 bg-color-surface p-8 rounded-lg shadow-lg border border-color-border" @submit="register">
        <div class="flex flex-col items-center space-y-4">
          <div class="relative">
            <img :src="photoPreview || '/default-avatar.png'" alt="Avatar Preview" class="w-24 h-24 rounded-full object-cover border-4 border-color-border">
            <button v-if="photoPreview" @click="removePhoto" type="button" class="absolute -top-1 -right-1 btn-danger p-1.5 leading-none">&times;</button>
          </div>
          <label for="photo-upload" class="cursor-pointer btn-secondary">
            Upload Photo
          </label>
          <input id="photo-upload" name="photo" type="file" class="sr-only" @change="handleFileChange" accept="image/*">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="firstname" class="sr-only">First Name</label>
            <input v-model="firstname" id="firstname" name="firstname" type="text" required class="appearance-none rounded-md relative block w-full px-4 py-3 border border-color-border bg-color-bg placeholder-gray-500 text-color-text focus:outline-none focus:ring-color-primary focus:border-color-primary sm:text-sm" placeholder="First Name">
          </div>
          <div>
            <label for="lastname" class="sr-only">Last Name</label>
            <input v-model="lastname" id="lastname" name="lastname" type="text" required class="appearance-none rounded-md relative block w-full px-4 py-3 border border-color-border bg-color-bg placeholder-gray-500 text-color-text focus:outline-none focus:ring-color-primary focus:border-color-primary sm:text-sm" placeholder="Last Name">
          </div>
        </div>
        <div>
          <label for="email-address" class="sr-only">Email address</label>
          <input v-model="email" id="email-address" name="email" type="email" autocomplete="email" required class="appearance-none rounded-md relative block w-full px-4 py-3 border border-color-border bg-color-bg placeholder-gray-500 text-color-text focus:outline-none focus:ring-color-primary focus:border-color-primary sm:text-sm" placeholder="Email address">
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input v-model="password" id="password" name="password" type="password" autocomplete="new-password" required class="appearance-none rounded-md relative block w-full px-4 py-3 border border-color-border bg-color-bg placeholder-gray-500 text-color-text focus:outline-none focus:ring-color-primary focus:border-color-primary sm:text-sm" placeholder="Password">
        </div>
        <div>
          <label for="dob" class="sr-only">Date of Birth</label>
          <input v-model="dob" id="dob" name="dob" type="date" required class="appearance-none rounded-md relative block w-full px-4 py-3 border border-color-border bg-color-bg placeholder-gray-500 text-color-text focus:outline-none focus:ring-color-primary focus:border-color-primary sm:text-sm">
        </div>

        <div v-if="successMessage" class="text-green-500 text-sm text-center">{{ successMessage }}</div>
        <div v-if="errorMessage" class="text-red-500 text-sm text-center">{{ errorMessage }}</div>

        <div>
          <button :disabled="isLoading" type="submit" class="group relative w-full flex justify-center btn-primary">
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </span>
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
