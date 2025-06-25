<template>
  <Header />
  <div class="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg">
    <h2 class="text-2xl font-bold mb-6 text-center">
      {{ editId ? 'Editar Actividad' : 'Crear Actividad' }}
    </h2>

    <form @submit.prevent="onSubmit" class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block font-semibold mb-1">Nombre</label>
        <input v-model="form.nombre" type="text" class="w-full border px-4 py-2 rounded" required />
      </div>

      <div>
        <label class="block font-semibold mb-1">Tipo de Actividad</label>
        <select v-model="form.tipoActividadId" class="w-full border px-4 py-2 rounded" required>
          <option value="">Selecciona un tipo</option>
          <option v-for="tipo in tiposActividad" :key="tipo.id" :value="tipo.id">
            {{ tipo.nombre }}
          </option>
        </select>
      </div>

      <div>
        <label class="block font-semibold mb-1">Periodicidad</label>
        <select v-model="form.periodicidad" class="w-full border px-4 py-2 rounded" required>
          <option v-for="item in opcionesPeriodicidad" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold mb-1">Lugar</label>
        <select v-model="form.lugar_id" class="w-full border px-4 py-2 rounded" required>
          <option value="">Selecciona un lugar</option>
          <option v-for="lugar in lugares" :key="lugar.id" :value="lugar.id">
            {{ lugar.nombre }}
          </option>
        </select>
      </div>

      <div>
        <label class="block font-semibold mb-1">Fecha de inicio</label>
        <input v-model="form.fechaInicio" type="date" class="w-full border px-4 py-2 rounded" required />
      </div>

      <div>
        <label class="block font-semibold mb-1">Fecha de fin</label>
        <input v-model="form.fechaFin" type="date" class="w-full border px-4 py-2 rounded" />
      </div>

      <div>
        <label class="block font-semibold mb-1">Cupo</label>
        <input v-model.number="form.cupo" type="number" min="1" class="w-full border px-4 py-2 rounded" />
      </div>

      <div>
        <label class="block font-semibold mb-1">Socio Comunitario</label>
        <select v-model="form.socioComunitarioId" class="w-full border px-4 py-2 rounded" required>
          <option value="">Selecciona un socio</option>
          <option v-for="socio in socios" :key="socio.id" :value="socio.id">
            {{ socio.nombre }}
          </option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="block font-semibold mb-1">Proyecto (opcional)</label>
        <select v-model="form.proyectoId" class="w-full border px-4 py-2 rounded">
          <option value="">Sin proyecto</option>
          <option v-for="proyecto in proyectos" :key="proyecto.id" :value="proyecto.id">
            {{ proyecto.nombre }}
          </option>
        </select>
      </div>

      <div class="md:col-span-2">
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {{ editId ? 'Actualizar' : 'Guardar' }} Actividad
        </button>
      </div>
    </form>

    <p v-if="message" :class="messageClass" class="mb-4">{{ message }}</p>

    <table class="w-full border-collapse border text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-2 py-1">ID</th>
          <th class="border px-2 py-1">Nombre</th>
          <th class="border px-2 py-1">Tipo Actividad</th>
          <th class="border px-2 py-1">Inicio</th>
          <th class="border px-2 py-1">Fin</th>
          <th class="border px-2 py-1">Cupo</th>
          <th class="border px-2 py-1">Periodicidad</th>
          <th class="border px-2 py-1">Socio Comunitario</th>
          <th class="border px-2 py-1">Proyecto</th>
          <th class="border px-2 py-1">Creado Por</th>
          <th class="border px-2 py-1">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="actividad in actividades" :key="actividad.id">
          <td class="border px-2 py-1">{{ actividad.id }}</td>
          <td class="border px-2 py-1">{{ actividad.nombre }}</td>
          <td class="border px-2 py-1">{{ actividad.tipoActividad?.nombre || 'N/A' }}</td>
          <td class="border px-2 py-1">{{ formatDate(actividad.fechaInicio) }}</td>
          <td class="border px-2 py-1">{{ formatDate(actividad.fechaFin) }}</td>
          <td class="border px-2 py-1">{{ actividad.cupo || '-' }}</td>
          <td class="border px-2 py-1">{{ actividad.periodicidad }}</td>
          <td class="border px-2 py-1">{{ actividad.socioComunitario?.nombre || 'N/A' }}</td>
          <td class="border px-2 py-1">{{ actividad.proyecto?.nombre || 'Sin proyecto' }}</td>
          <td class="border px-2 py-1">{{ actividad.creadoPorId }}</td>
          <td class="border px-2 py-1 text-center space-x-1">
            <button @click="startEdit(actividad)" class="text-blue-600 hover:underline">Editar</button>
            <button @click="deactivateActividad(actividad.id)" class="text-red-600 hover:underline">Desactivar</button>
          </td>
        </tr>
        <tr v-if="actividades.length === 0">
          <td colspan="11" class="text-center py-4">No hay actividades registradas.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig, useCookie } from '#app'
import Header from '~/components/Header.vue'

const config = useRuntimeConfig()
const token = useCookie('token').value || ''

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const user = decodeToken(token)
const userId = user?.id || null

const actividades = ref([])
const tiposActividad = ref([])
const socios = ref([])
const proyectos = ref([])
const lugares = ref([])

const opcionesPeriodicidad = ['diaria', 'semanal', 'mensual']

const form = ref({
  nombre: '',
  tipoActividadId: '',
  periodicidad: '',
  fechaInicio: '',
  fechaFin: '',
  lugar_id: '',
  cupo: null,
  socioComunitarioId: '',
  proyectoId: null
})

const editId = ref(null)
const message = ref('')
const messageClass = ref('')

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return isNaN(d) ? '' : d.toISOString().split('T')[0]
}

function resetForm() {
  form.value = {
    nombre: '',
    tipoActividadId: '',
    periodicidad: '',
    fechaInicio: '',
    fechaFin: '',
    lugar_id: '',
    cupo: null,
    socioComunitarioId: '',
    proyectoId: null
  }
  editId.value = null
}

async function fetchAllData() {
  try {
    const headers = { Authorization: `Bearer ${token}` }
    actividades.value = await $fetch('/api/activities', { baseURL: config.public.API_BASE_URL, headers })
    tiposActividad.value = await $fetch('/api/tipos-actividad', { baseURL: config.public.API_BASE_URL, headers })
    socios.value = await $fetch('/api/socios', { baseURL: config.public.API_BASE_URL, headers })
    proyectos.value = await $fetch('/api/proyectos', { baseURL: config.public.API_BASE_URL, headers })
    lugares.value = await $fetch('/api/lugares', { baseURL: config.public.API_BASE_URL, headers })
  } catch (e) {
    message.value = 'Error cargando datos'
    messageClass.value = 'text-red-600'
  }
}

function startEdit(actividad) {
  form.value = {
    nombre: actividad.nombre,
    tipoActividadId: actividad.tipoActividadId,
    periodicidad: actividad.periodicidad,
    fechaInicio: formatDate(actividad.fechaInicio),
    fechaFin: formatDate(actividad.fechaFin),
    lugar_id: actividad.lugar_id || '',
    cupo: actividad.cupo,
    socioComunitarioId: actividad.socioComunitarioId,
    proyectoId: actividad.proyectoId
  }
  editId.value = actividad.id
  message.value = ''
}

async function onSubmit() {
  try {
    const url = editId.value ? `/api/activities/${editId.value}` : '/api/activities'
    const method = editId.value ? 'PUT' : 'POST'

    const payload = {
      ...form.value,
      fechaInicio: new Date(form.value.fechaInicio),
      fechaFin: form.value.fechaFin ? new Date(form.value.fechaFin) : null,
      creadoPorId: editId.value ? undefined : userId
    }

    await $fetch(url, {
      method,
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    message.value = editId.value ? 'Actividad actualizada con éxito' : 'Actividad creada con éxito'
    messageClass.value = 'text-green-600'
    resetForm()
    fetchAllData()
  } catch (error) {
    message.value = error?.data?.error || 'Error en la operación'
    messageClass.value = 'text-red-600'
  }
}

async function deactivateActividad(id) {
  if (!confirm('¿Seguro quieres desactivar esta actividad?')) return

  try {
    await $fetch(`/api/activities/${id}`, {
      method: 'PUT',
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
      body: { estado: 'Cancelada' }
    })
    message.value = 'Actividad desactivada correctamente'
    messageClass.value = 'text-green-600'
    fetchAllData()
  } catch (error) {
    message.value = error?.data?.error || 'Error desactivando actividad'
    messageClass.value = 'text-red-600'
  }
}

onMounted(fetchAllData)
</script>
