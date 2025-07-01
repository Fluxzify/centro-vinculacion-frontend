<template>
  <Header />
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Gestión de Oferentes</h1>

    <form @submit.prevent="onSubmit" class="mb-6 p-4 border rounded shadow">
      <h2 class="text-xl mb-2">{{ editId ? 'Editar Oferente' : 'Nuevo Oferente' }}</h2>

      <input
        v-model="nombre"
        type="text"
        placeholder="Nombre del oferente"
        class="border p-2 rounded w-full mb-2"
        required
      />

      <input
        v-model="docenteResponsable"
        type="text"
        placeholder="Docente Responsable"
        class="border p-2 rounded w-full mb-2"
        required
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
          <th class="border px-4 py-2 text-left">Docente Responsable</th>
          <th class="border px-4 py-2 text-center">Activo</th>
          <th class="border px-4 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="oferente in oferentes" :key="oferente.id">
          <td class="border px-4 py-2">{{ oferente.id }}</td>
          <td class="border px-4 py-2">{{ oferente.nombre }}</td>
          <td class="border px-4 py-2">{{ oferente.docenteResponsable }}</td>
          <td class="border px-4 py-2 text-center">{{ oferente.activo ? 'Sí' : 'No' }}</td>
          <td class="border px-4 py-2 text-center space-x-2">
            <button @click="startEdit(oferente)" class="text-blue-600 hover:underline">Editar</button>
            <button @click="deleteOferente(oferente.id)" class="text-red-600 hover:underline">Eliminar</button>
          </td>
        </tr>
        <tr v-if="oferentes.length === 0">
          <td colspan="5" class="text-center py-4">No hay oferentes registrados.</td>
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

const oferentes = ref([])
const nombre = ref('')
const docenteResponsable = ref('')
const activo = ref(true)
const editId = ref(null)
const message = ref('')
const messageClass = ref('')

async function fetchOferentes() {
  try {
    const data = await $fetch('/api/oferentes', {
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    oferentes.value = data
  } catch {
    message.value = 'Error cargando oferentes'
    messageClass.value = 'text-red-600'
  }
}

function resetForm() {
  nombre.value = ''
  docenteResponsable.value = ''
  activo.value = true
  editId.value = null
}

function startEdit(oferente) {
  nombre.value = oferente.nombre
  docenteResponsable.value = oferente.docenteResponsable
  activo.value = oferente.activo
  editId.value = oferente.id
  message.value = ''
  messageClass.value = ''
}

function cancelEdit() {
  resetForm()
  message.value = ''
  messageClass.value = ''
}

async function onSubmit() {
  if (!nombre.value.trim() || !docenteResponsable.value.trim()) {
    message.value = 'Todos los campos son obligatorios'
    messageClass.value = 'text-red-600'
    return
  }

  try {
    if (editId.value) {
      await $fetch(`/api/oferentes/${editId.value}`, {
        method: 'PUT',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          nombre: nombre.value,
          docenteResponsable: docenteResponsable.value,
          activo: activo.value
        }
      })
      message.value = 'Oferente actualizado con éxito'
    } else {
      await $fetch('/api/oferentes', {
        method: 'POST',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          nombre: nombre.value,
          docenteResponsable: docenteResponsable.value,
          activo: activo.value
        }
      })
      message.value = 'Oferente creado con éxito'
    }

    messageClass.value = 'text-green-600'
    resetForm()
    fetchOferentes()
  } catch (error) {
    message.value = error?.data?.error || 'Error en la operación'
    messageClass.value = 'text-red-600'
  }
}

async function deleteOferente(id) {
  if (!confirm('¿Seguro quieres eliminar este oferente?')) return

  try {
    await $fetch(`/api/oferentes/${id}`, {
      method: 'DELETE',
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    message.value = 'Oferente eliminado con éxito'
    messageClass.value = 'text-green-600'
    fetchOferentes()
  } catch (error) {
    message.value = error?.data?.error || 'Error eliminando oferente'
    messageClass.value = 'text-red-600'
  }
}

onMounted(fetchOferentes)
</script>
