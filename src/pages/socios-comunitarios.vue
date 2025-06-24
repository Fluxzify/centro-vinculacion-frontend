<template>
  <Header />
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Gestión de Socios Comunitarios</h1>

    <form @submit.prevent="onSubmit" class="mb-6 p-4 border rounded shadow">
      <h2 class="text-xl mb-2">{{ editId ? 'Editar Socio' : 'Nuevo Socio' }}</h2>

      <input
        v-model="nombre"
        type="text"
        placeholder="Nombre socio"
        class="border p-2 rounded w-full mb-2"
        required
      />

      <div class="mb-4 flex items-center">
        <input
          id="activo"
          type="checkbox"
          v-model="activo"
          class="mr-2"
        />
        <label for="activo">Activo</label>
      </div>

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
          <th class="border px-4 py-2 text-left">Activo</th>
          <th class="border px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="socio in socios" :key="socio.id" :class="!socio.activo ? 'bg-red-50' : ''">
          <td class="border px-4 py-2">{{ socio.id }}</td>
          <td class="border px-4 py-2">{{ socio.nombre }}</td>
          <td class="border px-4 py-2">{{ socio.activo ? 'Sí' : 'No' }}</td>
          <td class="border px-4 py-2 text-center space-x-2">
            <button
              @click="startEdit(socio)"
              class="text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              @click="deactivateSocio(socio.id)"
              class="text-red-600 hover:underline"
              :disabled="!socio.activo"
            >
              Desactivar
            </button>
          </td>
        </tr>
        <tr v-if="socios.length === 0">
          <td colspan="4" class="text-center py-4">No hay socios registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import { useCookie } from '#app'

const config = useRuntimeConfig()
const socios = ref([])
const nombre = ref('')
const activo = ref(true)
const editId = ref(null)
const message = ref('')
const messageClass = ref('')
const token = useCookie('token').value || ''

async function fetchSocios() {
  try {
    const data = await $fetch('/api/socios', {
      baseURL: config.public.API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    socios.value = data
  } catch {
    message.value = 'Error cargando socios'
    messageClass.value = 'text-red-600'
  }
}

function resetForm() {
  nombre.value = ''
  activo.value = true
  editId.value = null
}

function startEdit(socio) {
  nombre.value = socio.nombre
  activo.value = socio.activo
  editId.value = socio.id
  message.value = ''
}

function cancelEdit() {
  resetForm()
  message.value = ''
}

async function onSubmit() {
  if (!nombre.value.trim()) {
    message.value = 'El nombre es obligatorio'
    messageClass.value = 'text-red-600'
    return
  }

  try {
    if (editId.value) {
      await $fetch(`/api/socios/${editId.value}`, {
        method: 'PUT',
        baseURL: config.public.API_BASE_URL,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          nombre: nombre.value,
          activo: activo.value
        }
      })
      message.value = 'Socio actualizado con éxito'
    } else {
      await $fetch('/api/socios', {
        method: 'POST',
        baseURL: config.public.API_BASE_URL,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          nombre: nombre.value,
          activo: activo.value
        }
      })
      message.value = 'Socio creado con éxito'
    }

    messageClass.value = 'text-green-600'
    resetForm()
    fetchSocios()
  } catch (error) {
    message.value = error?.data?.error || 'Error en la operación'
    messageClass.value = 'text-red-600'
  }
}

async function deactivateSocio(id) {
  if (!confirm('¿Seguro quieres desactivar este socio?')) return

  try {
    await $fetch(`/api/socios/${id}`, {
      method: 'PUT',
      baseURL: config.public.API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        activo: false
      }
    })
    message.value = 'Socio desactivado correctamente'
    messageClass.value = 'text-green-600'
    fetchSocios()
  } catch (error) {
    message.value = error?.data?.error || 'Error desactivando socio'
    messageClass.value = 'text-red-600'
  }
}

onMounted(fetchSocios)
</script>
