<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
      <h2 class="text-2xl font-bold text-center mb-6">Iniciar sesión</h2>
      <form @submit.prevent="login">
        <input
          v-model="email"
          type="email"
          placeholder="Correo"
          class="w-full mb-4 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="w-full mb-6 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Entrar
        </button>
      </form>
      <p v-if="error" class="text-red-600 text-center mt-4">{{ error }}</p>
      <p class="text-center text-sm mt-4">
        ¿No tienes cuenta?
        <NuxtLink to="/registro" class="text-blue-600 hover:underline">Regístrate</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const auth = useAuthStore()

const login = async () => {
  error.value = ''

  if (!email.value) {
    error.value = 'El correo es obligatorio'
    return
  }
  if (!password.value) {
    error.value = 'La contraseña es obligatoria'
    return
  }

  try {
    await auth.login(email.value, password.value)
    router.push('/calendarioPrincipal')
  } catch (e) {
    error.value = e.message
  }
}
</script>
