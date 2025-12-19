<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import api from '/src/api/api.js'

const emit = defineEmits(['close', 'enabled'])

const step = ref(1)
const qrCode = ref('')
const secret = ref('')
const verificationCode = ref('')
const backupCodes = ref([])
const loading = ref(false)
const error = ref('')

const setupTwoFactor = async () => {
  console.log("Début setupTwoFactor")
  loading.value = true
  error.value = ''

  try {
    console.log("Envoi requête POST /2fa/setup")
    const response = await api.post('/2fa/setup')
    console.log("Réponse reçue:", response)
    qrCode.value = response.data.qr_code
    secret.value = response.data.secret
    step.value = 2

    await new Promise(resolve => setTimeout(resolve, 100))
    gsap.from('.qr-container', {
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      ease: 'back.out(1.7)'
    })
  } catch (err) {
    console.error("Erreur setupTwoFactor:", err)
    if (err.response) {
        console.error("Détails erreur réponse:", err.response.data)
        error.value = err.response.data.error || 'Erreur lors de la configuration'
        if (err.response.data.exception_message) {
            console.error("Exception serveur:", err.response.data.exception_message)
        }
    } else {
        error.value = 'Erreur réseau ou inconnue'
    }
  } finally {
    loading.value = false
  }
}

const verifyAndEnable = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    error.value = 'Le code doit contenir 6 chiffres'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await api.post('/2fa/enable', {
      code: verificationCode.value
    })

    backupCodes.value = response.data.backup_codes
    step.value = 3

    await new Promise(resolve => setTimeout(resolve, 100))
    gsap.from('.backup-codes-container', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: 'power3.out'
    })
  } catch (err) {
    error.value = err.response?.data?.error || 'Code invalide'
  } finally {
    loading.value = false
  }
}

const copyBackupCodes = () => {
  const text = backupCodes.value.join('\n')
  navigator.clipboard.writeText(text)
  alert('Codes de secours copiés dans le presse-papier !')
}

const finish = () => {
  emit('enabled')
  emit('close')
}

onMounted(() => {
  setupTwoFactor()
})
</script>

<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" @click.self="emit('close')">
    <div class="bg-[#16181E] border border-[#2A2D36] rounded-lg w-full max-w-lg shadow-2xl">

      <!-- Header -->
      <header class="p-6 border-b border-[#2A2D36] flex items-center justify-between">
        <div>
          <h2 class="garamond text-2xl font-bold text-white">Activer l'authentification à deux facteurs</h2>
          <p class="text-sm text-[#82828A] mt-1">Étape {{ step }}/3</p>
        </div>
        <button @click="emit('close')" class="p-2 rounded-full text-[#82828A] hover:bg-white/10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </header>

      <!-- Body -->
      <main class="p-6">

        <!-- Étape 1 & 2: QR Code et vérification -->
        <div v-if="step === 2" class="space-y-6">
          <div class="qr-container bg-white p-6 rounded-lg mx-auto w-fit">
            <img :src="qrCode" alt="QR Code" class="w-64 h-64">
          </div>

          <div class="space-y-4">
            <div class="bg-[#0d0d0f] border border-[#2A2D36] rounded-lg p-4">
              <p class="text-sm text-[#C1C1C7] mb-2">
                <strong class="text-white">1.</strong> Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
              </p>
              <p class="text-sm text-[#C1C1C7]">
                <strong class="text-white">2.</strong> Ou entrez manuellement cette clé :
              </p>
              <code class="block text-[#FFD700] space-y-0.5 bg-black/30 px-3 py-2 rounded mt-2 text-xs break-all font-mono">{{ secret }}</code>
            </div>

            <div>
              <label class="block text-sm font-medium text-[#C1C1C7] mb-2">
                Entrez le code à 6 chiffres généré par votre application
              </label>
              <input
                  v-model="verificationCode"
                  type="text"
                  maxlength="6"
                  pattern="[0-9]*"
                  placeholder="123456"
                  class="w-full px-4 py-3 bg-[#0d0d0f] border border-[#2A2D36] rounded-md text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              >
            </div>

            <div v-if="error" class="bg-red-900/20 border border-red-800/30 text-red-400 p-3 rounded-md text-sm">
              {{ error }}
            </div>

            <button
                @click="verifyAndEnable"
                :disabled="loading || verificationCode.length !== 6"
                class="w-full px-6 py-3 bg-[#FFD700] hover:bg-[#FFE55C] text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Vérification...' : 'Vérifier et activer' }}
            </button>
          </div>
        </div>

        <!-- Étape 3: Codes de secours -->
        <div v-if="step === 3" class="backup-codes-container space-y-6">
          <div class="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <div>
                <h3 class="text-yellow-400 font-semibold mb-1">Important : Sauvegardez ces codes !</h3>
                <p class="text-sm text-[#C1C1C7]">
                  Ces codes de secours vous permettront de vous connecter si vous perdez l'accès à votre application d'authentification.
                  Chaque code ne peut être utilisé qu'une seule fois.
                </p>
              </div>
            </div>
          </div>

          <div class="bg-[#0d0d0f] border border-[#2A2D36] rounded-lg p-4">
            <h4 class="text-white font-semibold mb-3">Vos codes de secours</h4>
            <div class="grid grid-cols-2 gap-2 font-mono text-sm">
              <div
                  v-for="(code, index) in backupCodes"
                  :key="index"
                  class="bg-[#16181E] border border-[#2A2D36] rounded px-3 py-2 text-[#FFD700] text-center"
              >
                {{ code }}
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
                @click="copyBackupCodes"
                class="flex-1 px-6 py-3 bg-[#1E2129] hover:bg-[#2A2D36] border border-[#2A2D36] text-white font-bold rounded-lg transition-all"
            >
              📋 Copier les codes
            </button>
            <button
                @click="finish"
                class="flex-1 px-6 py-3 bg-[#FFD700] hover:bg-[#FFE55C] text-black font-bold rounded-lg transition-all"
            >
              Terminer
            </button>
          </div>
        </div>

        <!-- Loading initial -->
        <div v-if="step === 1" class="flex flex-col items-center justify-center py-12">
          <div class="flex gap-2 mb-4">
            <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce"></div>
            <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          <p class="text-[#C1C1C7]">Configuration en cours...</p>
        </div>
      </main>
    </div>
  </div>
</template>