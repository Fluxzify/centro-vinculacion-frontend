<template>
  <Header />
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Gestión de Lugares</h1>

    <form @submit.prevent="onSubmit" class="mb-6 p-4 border rounded shadow">
      <h2 class="text-xl mb-2">{{ editId ? 'Editar Lugar' : 'Nuevo Lugar' }}</h2>

      <input
        v-model="nombre"
        type="text"
        placeholder="Nombre del lugar"
        class="border p-2 rounded w-full mb-2"
        required
      />

      <input
        v-model.number="cupo"
        type="number"
        placeholder="Cupo"
        class="border p-2 rounded w-full mb-2"
        min="0"
      />

      <label class="inline-flex items-center mb-4">
        <input type="checkbox" v-model="activo" class="mr-2" />
        Activo
      </label>

      <button type="submit" class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
        {{ editId ? 'Actualizar' : 'Crear' }}
      </button>

      <button
        v-if="editId"
        type="button"
        @click="cancelEdit"
        class="ml-2 py-2 px-4 rounded border border-gray-400 hover:bg-gray-100"
      >
        Cancelar
      </button>
    </form>

    <p v-if="message" :class="messageClass" class="mb-4">{{ message }}</p>

    <table class="w-full border-collapse border">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-4 py-2 text-left">ID</th>
          <th class="border px-4 py-2 text-left">Nombre</th>
          <th class="border px-4 py-2 text-right">Cupo</th>
          <th class="border px-4 py-2 text-center">Activo</th>
          <th class="border px-4 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="lugar in lugares" :key="lugar.id">
          <td class="border px-4 py-2">{{ lugar.id }}</td>
          <td class="border px-4 py-2">{{ lugar.nombre }}</td>
          <td class="border px-4 py-2 text-right">{{ lugar.cupo ?? 'Sin cupo' }}</td>
          <td class="border px-4 py-2 text-center">{{ lugar.activo ? 'Sí' : 'No' }}</td>
          <td class="border px-4 py-2 text-center space-x-2">
            <button @click="startEdit(lugar)" class="text-blue-600 hover:underline">Editar</button>
            <button @click="deleteLugar(lugar.id)" class="text-red-600 hover:underline">Eliminar</button>
          </td>
        </tr>
        <tr v-if="lugares.length === 0">
          <td colspan="5" class="text-center py-4">No hay lugares registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig, useCookie } from '#app'

const config = useRuntimeConfig()
const token = useCookie('token').value || ''

const lugares = ref([])
const nombre = ref('')
const cupo = ref(null)
const activo = ref(true)
const editId = ref(null)
const message = ref('')
const messageClass = ref('')

async function fetchLugares() {
  try {
    const data = await $fetch('/api/lugares', {
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    lugares.value = data
  } catch {
    message.value = 'Error cargando lugares'
    messageClass.value = 'text-red-600'
  }
}

function resetForm() {
  nombre.value = ''
  cupo.value = null
  activo.value = true
  editId.value = null
}

function startEdit(lugar) {
  nombre.value = lugar.nombre
  cupo.value = lugar.cupo
  activo.value = lugar.activo
  editId.value = lugar.id
  message.value = ''
  messageClass.value = ''
}

function cancelEdit() {
  resetForm()
  message.value = ''
  messageClass.value = ''
}

async function onSubmit() {
  if (!nombre.value.trim()) {
    message.value = 'El nombre del lugar es obligatorio'
    messageClass.value = 'text-red-600'
    return
  }

  try {
    const body = {
      nombre: nombre.value,
      cupo: cupo.value || null,
      activo: activo.value
    }

    if (editId.value) {
      await $fetch(`/api/lugares/${editId.value}`, {
        method: 'PUT',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body
      })
      message.value = 'Lugar actualizado con éxito'
    } else {
      await $fetch('/api/lugares', {
        method: 'POST',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body
      })
      message.value = 'Lugar creado con éxito'
    }

    messageClass.value = 'text-green-600'
    resetForm()
    fetchLugares()
  } catch (error) {
    message.value = error?.data?.error || 'Error en la operación'
    messageClass.value = 'text-red-600'
  }
}

async function deleteLugar(id) {
  if (!confirm('¿Seguro quieres eliminar este lugar?')) return

  try {
    await $fetch(`/api/lugares/${id}`, {
      method: 'DELETE',
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    message.value = 'Lugar eliminado con éxito'
    messageClass.value = 'text-green-600'
    fetchLugares()
  } catch (error) {
    message.value = error?.data?.error || 'Error eliminando lugar'
    messageClass.value = 'text-red-600'
  }
}

onMounted(fetchLugares)
</script>
