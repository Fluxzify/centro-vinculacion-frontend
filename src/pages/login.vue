<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
      <h2 class="text-2xl font-bold text-center mb-6">Iniciar sesión</h2>
      <form @submit.prevent="login">
        <input
          v-model="email"
          type="email"
          placeholder="Correo"
          class="w-full mb-1 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
        />
        <p v-if="emailError" class="text-red-600 text-sm mb-3">{{ emailError }}</p>

        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="w-full mb-1 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
        />
        <p v-if="passwordError" class="text-red-600 text-sm mb-3">{{ passwordError }}</p>

        <button
          type="submit"
          :disabled="!canSubmit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Entrar
        </button>
      </form>

      <p class="text-center text-sm mt-2">
        ¿Olvidaste tu contraseña?
        <NuxtLink to="/forgot-password" class="text-blue-600 hover:underline">Recupérala aquí</NuxtLink>
      </p>

      <p class="text-center text-sm mt-4">
        ¿No tienes cuenta?
        <NuxtLink to="/registro" class="text-blue-600 hover:underline">Regístrate</NuxtLink>
      </p>
      <p v-if="error" class="text-red-600 text-center mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const emailError = ref('')
const passwordError = ref('')
const router = useRouter()
const auth = useAuthStore()

// Validaciones reactivas
watch(email, (newVal) => {
  emailError.value = !newVal ? 'El correo es obligatorio' : ''
})

watch(password, (newVal) => {
  passwordError.value = !newVal ? 'La contraseña es obligatoria' : ''
})

// Computed para habilitar o deshabilitar el botón
const canSubmit = computed(() => {
  return email.value && password.value && !emailError.value && !passwordError.value
})

const login = async () => {
  error.value = ''
  if (!canSubmit.value) return

  try {
    await auth.login(email.value, password.value)
    router.push('/calendario-principal')
  } catch (e) {
    error.value = e.message || 'Credenciales incorrectas'
  }
}
</script>
