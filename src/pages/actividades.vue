<template>

  
  <Header />
  <div class="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg">
    <h2 class="text-2xl font-bold mb-6 text-center">
      {{ editId ? 'Editar Actividad' : 'Crear Actividad' }}
    </h2>

    

    <form @submit.prevent="onSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <!-- Nombre -->
  <div>
    <label class="block font-semibold mb-1">Nombre Actividad</label>
    <input v-model="form.nombre" type="text" class="w-full border px-4 py-2 rounded" required />
  </div>

  <!-- Tipo de Actividad -->
  <div>
    <label class="block font-semibold mb-1">Tipo de Actividad</label>
    <select v-model="form.tipo_actividad_id" class="w-full border px-4 py-2 rounded" required>
      <option value="">Selecciona un tipo</option>
      <option v-for="tipo in tiposActividad" :key="tipo.id" :value="tipo.id">
        {{ tipo.nombre }}
      </option>
    </select>
  </div>

  <!-- Periodicidad -->
  <div>
    <label class="block font-semibold mb-1">Periodicidad</label>
    <select v-model="form.periodicidad" class="w-full border px-4 py-2 rounded" required>
      <option v-for="item in opcionesPeriodicidad" :key="item.value" :value="item.value">
        {{ item.text }}
      </option>
    </select>
  </div>

  <!-- Cupo -->
  <div>
    <label class="block font-semibold mb-1">Cupo</label>
    <input v-model.number="form.cupo" type="number" min="1" class="w-full border px-4 py-2 rounded" />
  </div>

  <!-- Socio Comunitario -->
  <div>
    <label class="block font-semibold mb-1">Socio Comunitario</label>
    <select v-model="form.socio_comunitario_id" class="w-full border px-4 py-2 rounded" required>
      <option value="">Selecciona un socio</option>
      <option v-for="socio in socios" :key="socio.id" :value="socio.id">
        {{ socio.nombre }}
      </option>
    </select>
  </div>

  <!-- Proyecto (opcional) -->
  <div>
    <label class="block font-semibold mb-1">Proyecto (opcional)</label>
    <select v-model="form.proyecto_id" class="w-full border px-4 py-2 rounded">
      <option :value="null">Sin proyecto</option>
      <option v-for="proyecto in proyectos" :key="proyecto.id" :value="proyecto.id">
        {{ proyecto.nombre }}
      </option>
    </select>
  </div>

  <!-- Estado (solo si está editando) -->
  <div v-if="editId">
    <label class="block font-semibold mb-1">Estado</label>
    <select v-model="form.estado" class="w-full border px-4 py-2 rounded">
      <option value="Programada">Programada</option>
      <option value="Cancelada">Cancelada</option>
      <option value="Completada">Completada</option>
    </select>
  </div>

  <!-- Sección de Citas -->
  <div class="md:col-span-2 border-t pt-4 mt-4">
    <h3 class="text-lg font-bold mb-2">Detalles de la Cita</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Fecha única -->
      <div>
        <label class="block font-semibold mb-1">Fecha</label>
        <input v-model="form.fecha_unica_cita" type="date" class="w-full border px-4 py-2 rounded" required />
      </div>

      <!-- Lugar -->
      <div>
        <label class="block font-semibold mb-1">Lugar</label>
        <select v-model="form.lugar_id_cita" class="w-full border px-4 py-2 rounded" required>
          <option value="">Selecciona un lugar</option>
          <option v-for="lugar in lugares" :key="lugar.id" :value="lugar.id">
            {{ lugar.nombre }}
          </option>
        </select>
      </div>

      <!-- Hora Inicio -->
      <div>
        <label class="block font-semibold mb-1">Hora Inicio</label>
        <input v-model="form.hora_inicio_cita" type="time" class="w-full border px-4 py-2 rounded" required />
      </div>

      <!-- Hora Fin (opcional) -->
      <div>
        <label class="block font-semibold mb-1">Hora Fin</label>
        <input v-model="form.hora_fin_cita" type="time" class="w-full border px-4 py-2 rounded" />
      </div>

      <!-- Fecha Fin si es Periódica -->
      <div v-if="form.periodicidad === 'Periódica'" class="md:col-span-2">
        <label class="block font-semibold mb-1">Fecha Fin de Citas</label>
        <input v-model="form.fecha_fin_periodica_citas" type="date" class="w-full border px-4 py-2 rounded" required />
      </div>
    </div>
  </div>

  <!-- Subida de Archivos -->
  <div class="md:col-span-2 mt-4">
    <label class="block font-semibold mb-1">Archivos Adjuntos</label>
    <input ref="fileInput" type="file" multiple class="w-full border px-4 py-2 rounded" />
  </div>

  <!-- Botón -->
  <div class="md:col-span-2">
    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
      {{ editId ? 'Actualizar Actividad' : 'Crear Actividad' }}
    </button>
  </div>
</form>

    <p v-if="message" :class="messageClass" class="p-3 my-4 rounded-lg font-bold text-center">
      {{ message }}
    </p>

    <table class="w-full border-collapse border text-sm mt-8">
  <thead>
    <tr class="bg-gray-100">
      <th class="border px-2 py-1">ID</th>
      <th class="border px-2 py-1">Nombre</th>
      <th class="border px-2 py-1">Tipo</th>
      <th class="border px-2 py-1">Periodicidad</th>
      <th class="border px-2 py-1">Fecha Inicio</th>
      <th class="border px-2 py-1">Fecha Fin</th>
      <th class="border px-2 py-1">Cupo</th>
      <th class="border px-2 py-1">Socio Comunitario</th>
      <th class="border px-2 py-1">Proyecto</th>
      <th class="border px-2 py-1">Estado</th>
      <th class="border px-2 py-1">Creado Por</th>
      <th class="border px-2 py-1">Fecha Creación</th>
      <th class="border px-2 py-1">Archivos</th>
      <th class="border px-2 py-1">Acciones</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="actividad in actividades" :key="actividad.id">
      <td class="border px-2 py-1">{{ actividad.id }}</td>
      <td class="border px-2 py-1">{{ actividad.nombre }}</td>
      <td class="border px-2 py-1">{{ actividad.tipoActividad?.nombre || '-' }}</td>
      <td class="border px-2 py-1">{{ actividad.periodicidad }}</td>
      <td class="border px-2 py-1">{{ actividad.fechaInicio?.slice(0,10) }}</td>
      <td class="border px-2 py-1">{{ actividad.fechaFin ? actividad.fechaFin.slice(0,10) : '-' }}</td>
      <td class="border px-2 py-1">{{ actividad.cupo ?? '-' }}</td>
      <td class="border px-2 py-1">{{ actividad.socioComunitario?.nombre || '-' }}</td>
      <td class="border px-2 py-1">{{ actividad.proyecto?.nombre || '-' }}</td>
      <td class="border px-2 py-1">{{ actividad.estado }}</td>
      <td class="border px-2 py-1">{{ actividad.creadoPorId }}</td>
      <td class="border px-2 py-1">{{ actividad.fechaCreacion?.slice(0,10) }}</td>

     <td class="border px-2 py-1 text-center">
  <div v-if="actividad.archivos && actividad.archivos.length > 0">
    <ul class="list-disc text-left ml-4">
      <li v-for="archivo in actividad.archivos" :key="archivo.id">
        <a
          :href="`${config.public.API_BASE_URL}api/files/download/${archivo.ruta.split('/').pop()}`"
          :download="archivo.nombre"
          class="text-blue-600 hover:underline"
          target="_blank"
        >
          {{ archivo.nombre }}
        </a>
      </li>
    </ul>
  </div>
  <span v-else class="text-gray-400">Sin archivos</span>
</td>

      <td class="border px-2 py-1 text-center space-x-1">
        <button @click="startEdit(actividad)" class="text-blue-600 hover:underline">Editar</button>
        <button @click="deactivateActividad(actividad.id)" class="text-red-600 hover:underline">Cancelar</button>
      </td>
    </tr>

    <tr v-if="actividades.length === 0">
      <td colspan="14" class="text-center py-4 text-gray-500">No hay actividades registradas.</td>
    </tr>
  </tbody>
</table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRuntimeConfig, useCookie } from '#app'
import Header from '~/components/Header.vue'

const config = useRuntimeConfig()
const token = useCookie('token').value || ''
const router = useRouter()

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    console.error('Error decodificando token:', e)
    return null
  }
}
const decodedUser = decodeToken(token)
const userId = ref(decodedUser?.userId || null)

const actividades = ref([])
const tiposActividad = ref([])
const socios = ref([])
const proyectos = ref([])
const lugares = ref([])

const fileInput = ref(null)

const opcionesPeriodicidad = [
  { value: 'Puntual', text: 'Puntual' },
  { value: 'Periódica', text: 'Periódica' }
]

const form = ref({
  nombre: '',
  tipo_actividad_id: '',
  periodicidad: '',
  cupo: null,
  socio_comunitario_id: '',
  proyecto_id: null,
  estado: 'Programada',
  lugar_id_cita: '',
  fecha_unica_cita: '',
  hora_inicio_cita: '',
  hora_fin_cita: '',
  fecha_fin_periodica_citas: ''
})

const editId = ref(null)
const message = ref('')
const messageClass = ref('')

onMounted(() => {
  fetchAllData()
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return isNaN(d) ? '' : d.toISOString().split('T')[0]
}

async function fetchAllData() {
  try {
    console.log(actividades.value)
    const headers = { Authorization: `Bearer ${token}` }
    actividades.value = await $fetch('/api/activities', { baseURL: config.public.API_BASE_URL, headers })
    tiposActividad.value = await $fetch('/api/tipos-actividad', { baseURL: config.public.API_BASE_URL, headers })
    socios.value = await $fetch('/api/socios', { baseURL: config.public.API_BASE_URL, headers })
    proyectos.value = await $fetch('/api/proyectos', { baseURL: config.public.API_BASE_URL, headers })
    lugares.value = await $fetch('/api/lugares', { baseURL: config.public.API_BASE_URL, headers })
  } catch (e) {
    console.error('Error cargando datos:', e)
    message.value = 'Error cargando datos iniciales'
    messageClass.value = 'bg-red-100 text-red-800'
  }
}

function resetForm() {
  form.value = {
    nombre: '',
    tipo_actividad_id: '',
    periodicidad: '',
    cupo: null,
    socio_comunitario_id: '',
    proyecto_id: null,
    estado: 'Programada',
    lugar_id_cita: '',
    fecha_unica_cita: '',
    hora_inicio_cita: '',
    hora_fin_cita: '',
    fecha_fin_periodica_citas: ''
  }
  editId.value = null
  message.value = ''
  messageClass.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

// ✅ Método para editar actividad
async function startEdit(actividad) {
  console.log(actividad.citas)
  form.value = {
    nombre: actividad.nombre,
    tipo_actividad_id: actividad.tipoActividadId,
    periodicidad: actividad.periodicidad,
    cupo: actividad.cupo,
    socio_comunitario_id: actividad.socioComunitarioId,
    proyecto_id: actividad.proyectoId,
    estado: actividad.estado,
    lugar_id_cita: actividad.citas?.[0]?.lugarId || '',
    fecha_unica_cita: formatDate(actividad.fechaInicio),
    hora_inicio_cita: actividad.citas?.[0]?.horaInicio?.slice(0, 5) || '',
    hora_fin_cita: actividad.citas?.[0]?.horaFin?.slice(0, 5) || '',
    fecha_fin_periodica_citas: formatDate(actividad.fechaFin)
  }
  editId.value = actividad.id
  message.value = ''
  messageClass.value = ''
}

// ✅ Método para cancelar/desactivar actividad
async function deactivateActividad(id) {
  const motivo = window.prompt('Por favor, proporciona un motivo para la cancelación:')

  if (motivo === null) {
    message.value = 'Cancelación abortada.'
    messageClass.value = 'bg-yellow-100 text-yellow-800'
    return
  }

  if (!motivo.trim()) {
    message.value = 'Debe proporcionar un motivo para la cancelación.'
    messageClass.value = 'bg-red-100 text-red-800'
    return
  }

  try {
    await $fetch(`/api/activities/${id}`, {
      method: 'PUT',
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        estado: 'Cancelada',
        motivoCancelacion: motivo
      }
    })

    message.value = 'Actividad cancelada correctamente.'
    messageClass.value = 'bg-green-100 text-green-800'
    fetchAllData()
  } catch (error) {
    console.error('Error al cancelar la actividad:', error)
    message.value = error?.data?.error || 'Error al cancelar la actividad.'
    messageClass.value = 'bg-red-100 text-red-800'
  }
}


async function onSubmit() {

  if (!editId.value) {
  if (!form.value.fecha_unica_cita || !form.value.lugar_id_cita || !form.value.hora_inicio_cita) {
    message.value = 'Lugar, Fecha y Hora Inicio son obligatorios para la cita.';
    messageClass.value = 'bg-red-100 text-red-800';
    return;
  }

  if (form.value.periodicidad === 'Periódica' && !form.value.fecha_fin_periodica_citas) {
    message.value = 'Debes indicar una fecha fin para citas periódicas.';
    messageClass.value = 'bg-red-100 text-red-800';
    return;
  }

  if (
    form.value.periodicidad === 'Periódica' &&
    new Date(form.value.fecha_unica_cita) > new Date(form.value.fecha_fin_periodica_citas)
  ) {
    message.value = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
    messageClass.value = 'bg-red-100 text-red-800';
    return;
  }

  if (!userId.value) {
    message.value = 'No se pudo obtener el usuario creador. Inicia sesión nuevamente.';
    messageClass.value = 'bg-red-100 text-red-800';
    return;
  }
}
  try {

    const actividadPayload = {
      nombre: form.value.nombre,
      tipoActividadId: Number(form.value.tipo_actividad_id),
      periodicidad: form.value.periodicidad,
      fechaInicio: form.value.fecha_unica_cita,
      fechaFin: form.value.fecha_fin_periodica_citas || null,
      socioComunitarioId: Number(form.value.socio_comunitario_id),
      proyectoId: form.value.proyecto_id ? Number(form.value.proyecto_id) : null,
      cupo: form.value.cupo ? Number(form.value.cupo) : null,
      estado: form.value.estado
    }

    let actividadResult

    if (editId.value) {
      // Editar actividad existente
      actividadResult = await $fetch(`/api/activities/${editId.value}`, {
        method: 'PUT',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body: actividadPayload
      })
    } else {
  const res = await $fetch('/api/activities', {
    method: 'POST',
    baseURL: config.public.API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
    body: actividadPayload
  })
  actividadResult = res.actividad

  // 🔐 Validación adicional
  if (!actividadResult || !actividadResult.id || isNaN(actividadResult.id)) {
    throw new Error('La actividad no se creó correctamente. ID inválido.')
  }
}
if (!editId.value && actividadResult?.id) {
  const citaPayload = {
    actividadId: actividadResult.id,
    lugarId: Number(form.value.lugar_id_cita),
    fecha: form.value.fecha_unica_cita,
    horaInicio: form.value.hora_inicio_cita,
    horaFin: form.value.hora_fin_cita || null,
    creadoPorId: userId.value,
    periodicidadTipo: form.value.periodicidad
  }

  if (form.value.periodicidad === 'Puntual') {
    await $fetch('/api/citas', {
      method: 'POST',
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
      body: citaPayload
    })
  } else if (form.value.periodicidad === 'Periódica') {
    await $fetch('/api/citas', {
      method: 'POST',
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        ...citaPayload,
        fechaInicioPeriodica: form.value.fecha_unica_cita,
        fechaFinPeriodica: form.value.fecha_fin_periodica_citas
      }
    })
  }
}


    // Subir archivos si hay alguno cargado
    if (fileInput.value && fileInput.value.files.length > 0) {
      const formData = new FormData()
      for (const file of fileInput.value.files) {
        formData.append('files', file)
      }

      const uploadRes = await fetch(`${config.public.API_BASE_URL}api/files/${actividadResult.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!uploadRes.ok) {
        const error = await uploadRes.json()
        throw new Error(error.error || 'Error al subir archivos')
      }

      const uploadData = await uploadRes.json()

      message.value = uploadData.mensaje || uploadData.message || 'Archivo(s) adjuntado(s) exitosamente'
      messageClass.value = 'bg-green-100 text-green-800'
    } else {
      message.value = 'Actividad guardada correctamente'
      messageClass.value = 'bg-green-100 text-green-800'
    }

    setTimeout(() => {
      resetForm()
      fetchAllData()
    }, 2000)

    await fetchAllData()

  } catch (error) {
    console.error('Error al enviar:', error)
    message.value = error.message || 'Error en la operación'
    messageClass.value = 'bg-red-100 text-red-800'
  }
}


</script>


<style>
/* Estilos adicionales si son necesarios, Tailwind CSS ya proporciona la mayoría */
</style>
