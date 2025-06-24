<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
      <h2 class="text-2xl font-bold text-center mb-6">Registrarse</h2>
      <form @submit.prevent="registrar">
        <input v-model="nombre" type="text" placeholder="Nombre" class="w-full mb-4 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400" />
        <input v-model="email" type="email" placeholder="Correo" class="w-full mb-4 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400" />
        <input v-model="password" type="password" placeholder="Contraseña" class="w-full mb-6 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400" />
        <button class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">Crear cuenta</button>
      </form>
      <p v-if="error" class="text-red-600 text-center mt-4">{{ error }}</p>
      <p class="text-center text-sm mt-4">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" class="text-blue-600 hover:underline">Inicia sesión</NuxtLink>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const nombre = ref('')
const email = ref('')
const password = ref('')
const error = ref(null)

const registrar = async () => {
  error.value = null
 try {
  await auth.register(nombre.value, email.value, password.value)
  router.push('/calendario-principal')
} catch (e: any) {
  error.value = e.message
}
}
</script>
