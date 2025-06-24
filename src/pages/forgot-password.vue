<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
      <h2 class="text-2xl font-bold text-center mb-6">Recuperar contraseña</h2>
      <form @submit.prevent="enviarCorreo">
        <input
          v-model="email"
          type="email"
          placeholder="Correo electrónico"
          class="w-full mb-4 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Enviar correo de recuperación
        </button>
      </form>
      <p v-if="mensaje" class="text-green-600 text-center mt-4">{{ mensaje }}</p>
      <p v-if="error" class="text-red-600 text-center mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const mensaje = ref('')
const error = ref('')

const enviarCorreo = async () => {
  mensaje.value = ''
  error.value = ''

  if (!email.value) {
    error.value = 'Debes ingresar un correo'
    return
  }

  try {
    const config = useRuntimeConfig()

await $fetch('/api/auth/forgot-password', {
  method: 'POST',
  baseURL: config.public.API_BASE_URL,
  body: { email: email.value },
  credentials: 'include'
})
    mensaje.value = 'Se ha enviado un correo con instrucciones'
  } catch (e) {
    error.value = e?.data?.error || 'No se pudo enviar el correo'
  }
}
</script>
