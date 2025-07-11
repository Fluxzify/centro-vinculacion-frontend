<template>
  <Header />
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Gestión de Proyectos</h1>

    <form @submit.prevent="onSubmit" class="mb-6 p-4 border rounded shadow">
      <h2 class="text-xl mb-2">{{ editId ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</h2>

      <input
        v-model="nombre"
        type="text"
        placeholder="Nombre del proyecto"
        class="border p-2 rounded w-full mb-2"
        required
      />

      <textarea
        v-model="descripcion"
        placeholder="Descripción (opcional)"
        class="border p-2 rounded w-full mb-2"
        rows="3"
      ></textarea>

      <div class="mb-2">
        <label for="fechaInicio" class="block font-semibold mb-1">Fecha Inicio *</label>
        <input
          v-model="fechaInicio"
          type="date"
          id="fechaInicio"
          class="border p-2 rounded w-full mb-2"
          required
        />
      </div>

      <div class="mb-4">
        <label for="fechaFin" class="block font-semibold mb-1">Fecha Fin</label>
        <input
          v-model="fechaFin"
          type="date"
          id="fechaFin"
          class="border p-2 rounded w-full mb-2"
        />
      </div>

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
          <th class="border px-4 py-2 text-left">Fecha Inicio</th>
          <th class="border px-4 py-2 text-left">Fecha Fin</th>
          <th class="border px-4 py-2 text-left">Activo</th>
          <th class="border px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="proyecto in proyectos"
          :key="proyecto.id"
          :class="!proyecto.activo ? 'bg-red-50' : ''"
        >
          <td class="border px-4 py-2">{{ proyecto.id }}</td>
          <td class="border px-4 py-2">{{ proyecto.nombre }}</td>
          <td class="border px-4 py-2">{{ formatDate(proyecto.fechaInicio) }}</td>
          <td class="border px-4 py-2">{{ formatDate(proyecto.fechaFin) }}</td>
          <td class="border px-4 py-2">{{ proyecto.activo ? 'Sí' : 'No' }}</td>
          <td class="border px-4 py-2 text-center space-x-2">
            <button
              @click="startEdit(proyecto)"
              class="text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              @click="deactivateProyecto(proyecto.id)"
              class="text-red-600 hover:underline"
              :disabled="!proyecto.activo"
            >
              Desactivar
            </button>
          </td>
        </tr>
        <tr v-if="proyectos.length === 0">
          <td colspan="6" class="text-center py-4">No hay proyectos registrados.</td>
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

const proyectos = ref([])
const nombre = ref('')
const descripcion = ref('')
const fechaInicio = ref('')
const fechaFin = ref('')
const activo = ref(true)
const editId = ref(null)
const message = ref('')
const messageClass = ref('')

// Función para formatear fecha ISO en yyyy-mm-dd (o ajusta a tu formato preferido)
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date)) return ''
  return date.toISOString().split('T')[0]
}

async function fetchProyectos() {
  try {
    const data = await $fetch('/api/proyectos', {
      baseURL: config.public.API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    proyectos.value = data
  } catch {
    message.value = 'Error cargando proyectos'
    messageClass.value = 'text-red-600'
  }
}

function resetForm() {
  nombre.value = ''
  descripcion.value = ''
  fechaInicio.value = ''
  fechaFin.value = ''
  activo.value = true
  editId.value = null
}

function startEdit(proyecto) {
  nombre.value = proyecto.nombre
  descripcion.value = proyecto.descripcion
  fechaInicio.value = proyecto.fechaInicio
  fechaFin.value = proyecto.fechaFin
  activo.value = proyecto.activo
  editId.value = proyecto.id
  message.value = ''
}

function cancelEdit() {
  resetForm()
  message.value = ''
}

async function onSubmit() {
  if (!nombre.value.trim() || !fechaInicio.value) {
    message.value = 'Nombre y fecha inicio son obligatorios'
    messageClass.value = 'text-red-600'
    return
  }

  const fechaInicioISO = new Date(fechaInicio.value)
  const fechaFinISO = fechaFin.value ? new Date(fechaFin.value) : null

  try {
    if (editId.value) {
      await $fetch(`/api/proyectos/${editId.value}`, {
        method: 'PUT',
        baseURL: config.public.API_BASE_URL,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          nombre: nombre.value,
          descripcion: descripcion.value,
          fechaInicio: fechaInicioISO,
          fechaFin: fechaFinISO,
          activo: activo.value
        }
      })
      message.value = 'Proyecto actualizado con éxito'
    } else {
      await $fetch('/api/proyectos', {
        method: 'POST',
        baseURL: config.public.API_BASE_URL,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          nombre: nombre.value,
          descripcion: descripcion.value,
          fechaInicio: fechaInicioISO,
          fechaFin: fechaFinISO,
          activo: activo.value
        }
      })
      message.value = 'Proyecto creado con éxito'
    }

    messageClass.value = 'text-green-600'
    resetForm()
    fetchProyectos()
  } catch (error) {
    message.value = error?.data?.error || 'Error en la operación'
    messageClass.value = 'text-red-600'
  }
}

async function deactivateProyecto(id) {
  if (!confirm('¿Seguro quieres desactivar este proyecto?')) return

  try {
    await $fetch(`/api/proyectos/${id}`, {
      method: 'PUT',
      baseURL: config.public.API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        activo: false
      }
    })
    message.value = 'Proyecto desactivado correctamente'
    messageClass.value = 'text-green-600'
    fetchProyectos()
  } catch (error) {
    message.value = error?.data?.error || 'Error desactivando proyecto'
    messageClass.value = 'text-red-600'
  }
}

onMounted(fetchProyectos)
</script>
