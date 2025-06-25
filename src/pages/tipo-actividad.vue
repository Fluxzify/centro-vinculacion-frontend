<template>
  <Header />
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Gestión de Tipos de Actividad</h1>

    <form @submit.prevent="onSubmit" class="mb-6 p-4 border rounded shadow">
      <h2 class="text-xl mb-2">{{ editId ? 'Editar Tipo' : 'Nuevo Tipo' }}</h2>

      <input
        v-model="nombre"
        type="text"
        placeholder="Nombre del tipo"
        class="border p-2 rounded w-full mb-2"
        required
      />

      <textarea
        v-model="descripcion"
        placeholder="Descripción"
        class="border p-2 rounded w-full mb-2"
        rows="3"
        required
      ></textarea>

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
          <th class="border px-4 py-2 text-left">Descripción</th>
          <th class="border px-4 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tipo in tipos" :key="tipo.id">
          <td class="border px-4 py-2">{{ tipo.id }}</td>
          <td class="border px-4 py-2">{{ tipo.nombre }}</td>
          <td class="border px-4 py-2">{{ tipo.descripcion }}</td>
          <td class="border px-4 py-2 text-center space-x-2">
            <button @click="startEdit(tipo)" class="text-blue-600 hover:underline">Editar</button>
            <button @click="deleteTipo(tipo.id)" class="text-red-600 hover:underline">Eliminar</button>
          </td>
        </tr>
        <tr v-if="tipos.length === 0">
          <td colspan="4" class="text-center py-4">No hay tipos registrados.</td>
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

const tipos = ref([])
const nombre = ref('')
const descripcion = ref('')
const editId = ref(null)
const message = ref('')
const messageClass = ref('')

async function fetchTipos() {
  try {
    const data = await $fetch('/api/tipos-actividad', {
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    tipos.value = data
  } catch {
    message.value = 'Error cargando tipos de actividad'
    messageClass.value = 'text-red-600'
  }
}

function resetForm() {
  nombre.value = ''
  descripcion.value = ''
  editId.value = null
}

function startEdit(tipo) {
  nombre.value = tipo.nombre
  descripcion.value = tipo.descripcion
  editId.value = tipo.id
  message.value = ''
}

function cancelEdit() {
  resetForm()
  message.value = ''
}

async function onSubmit() {
  if (!nombre.value.trim() || !descripcion.value.trim()) {
    message.value = 'Todos los campos son obligatorios'
    messageClass.value = 'text-red-600'
    return
  }

  try {
    if (editId.value) {
      await $fetch(`/api/tipos-actividad/${editId.value}`, {
        method: 'PUT',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body: { nombre: nombre.value, descripcion: descripcion.value }
      })
      message.value = 'Tipo actualizado con éxito'
    } else {
      await $fetch('/api/tipos-actividad', {
        method: 'POST',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body: { nombre: nombre.value, descripcion: descripcion.value }
      })
      message.value = 'Tipo creado con éxito'
    }

    messageClass.value = 'text-green-600'
    resetForm()
    fetchTipos()
  } catch (error) {
    message.value = error?.data?.error || 'Error en la operación'
    messageClass.value = 'text-red-600'
  }
}

async function deleteTipo(id) {
  if (!confirm('¿Seguro quieres eliminar este tipo de actividad?')) return

  try {
    await $fetch(`/api/tipos-actividad/${id}`, {
      method: 'DELETE',
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    message.value = 'Tipo eliminado con éxito'
    messageClass.value = 'text-green-600'
    fetchTipos()
  } catch (error) {
    message.value = error?.data?.error || 'Error eliminando tipo'
    messageClass.value = 'text-red-600'
  }
}

onMounted(fetchTipos)
</script>
