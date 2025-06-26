<template>

  
  <Header />
  <div class="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg">
    <h2 class="text-2xl font-bold mb-6 text-center">
      {{ editId ? 'Editar Actividad' : 'Crear Actividad' }}
    </h2>

    

    <form @submit.prevent="onSubmit" class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Campos de Actividad -->
      <div>
        <label class="block font-semibold mb-1">Nombre Actividad</label>
        <input v-model="form.nombre" type="text" class="w-full border px-4 py-2 rounded" required />
      </div>

      <div>
        <label class="block font-semibold mb-1">Tipo de Actividad</label>
        <select v-model="form.tipo_actividad_id" class="w-full border px-4 py-2 rounded" required>
          <option value="">Selecciona un tipo</option>
          <option v-for="tipo in tiposActividad" :key="tipo.id" :value="tipo.id">
            {{ tipo.nombre }}
          </option>
        </select>
      </div>

      <div>
        <label class="block font-semibold mb-1">Periodicidad Actividad</label>
        <select v-model="form.periodicidad" class="w-full border px-4 py-2 rounded" required>
          <option v-for="item in opcionesPeriodicidad" :key="item.value" :value="item.value">{{ item.text }}</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold mb-1">Cupo</label>
        <input v-model.number="form.cupo" type="number" min="1" class="w-full border px-4 py-2 rounded" />
      </div>

      <div>
        <label class="block font-semibold mb-1">Socio Comunitario</label>
        <select v-model="form.socio_comunitario_id" class="w-full border px-4 py-2 rounded" required>
          <option value="">Selecciona un socio</option>
          <option v-for="socio in socios" :key="socio.id" :value="socio.id">
            {{ socio.nombre }}
          </option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="block font-semibold mb-1">Proyecto (opcional)</label>
        <select v-model="form.proyecto_id" class="w-full border px-4 py-2 rounded">
          <option :value="null">Sin proyecto</option>
          <option v-for="proyecto in proyectos" :key="proyecto.id" :value="proyecto.id">
            {{ proyecto.nombre }}
          </option>
        </select>
      </div>

      <div v-if="editId">
        <label class="block font-semibold mb-1">Estado Actividad</label>
        <select v-model="form.estado" class="w-full border px-4 py-2 rounded">
          <option value="Programada">Programada</option>
          <option value="Cancelada">Cancelada</option>
          <option value="Completada">Completada</option>
        </select>
      </div>

      <div class="md:col-span-2 border-t pt-4 mt-4">
        <h3 class="text-xl font-bold mb-4">Detalles de la Cita</h3>
        <p v-if="editId" class="text-sm text-gray-600 mb-4">
          La creación de citas es solo para nuevas actividades. Para modificar citas existentes, se requiere otra sección.
        </p>

        <!-- Campos para la creación de Cita (solo visibles si NO se está editando una actividad) -->
        <div v-if="!editId" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1">Fecha de la Cita</label>
            <input v-model="form.fecha_unica_cita" type="date" class="w-full border px-4 py-2 rounded" required />
          </div>

          <div>
            <label class="block font-semibold mb-1">Lugar de la Cita</label>
            <select v-model="form.lugar_id_cita" class="w-full border px-4 py-2 rounded" required>
              <option value="">Selecciona un lugar</option>
              <option v-for="lugar in lugares" :key="lugar.id" :value="lugar.id">
                {{ lugar.nombre }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-1">Hora Inicio Cita</label>
            <input v-model="form.hora_inicio_cita" type="time" class="w-full border px-4 py-2 rounded" required />
          </div>

          <div>
            <label class="block font-semibold mb-1">Hora Fin Cita (Opcional)</label>
            <input v-model="form.hora_fin_cita" type="time" class="w-full border px-4 py-2 rounded" />
          </div>

          <!-- Campo Fecha Fin Citas, visible solo si la periodicidad es Periódica y es una nueva actividad -->
          <div v-if="form.periodicidad === 'Periódica'">
            <label class="block font-semibold mb-1">Fecha Fin Citas</label>
            <input v-model="form.fecha_fin_periodica_citas" type="date" class="w-full border px-4 py-2 rounded" required />
          </div>
        </div>
      </div>


      <div class="md:col-span-2">
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {{ editId ? 'Actualizar' : 'Guardar' }} Actividad
        </button>
      </div>
    </form>

    <p v-if="message" :class="messageClass" class="p-3 my-4 rounded-lg font-bold text-center">
      {{ message }}
    </p>

    <table class="w-full border-collapse border text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-2 py-1">ID</th>
          <th class="border px-2 py-1">Nombre</th>
          <th class="border px-2 py-1">Tipo Actividad</th>
          <th class="border px-2 py-1">Inicio Actividad</th>
          <th class="border px-2 py-1">Cupo</th>
          <th class="border px-2 py-1">Periodicidad</th>
          <th class="border px-2 py-1">Socio Comunitario</th>
          <th class="border px-2 py-1">Proyecto</th>
          <th class="border px-2 py-1">Creado Por</th>
          <th class="border px-2 py-1">Estado</th>
          <th class="border px-2 py-1">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="actividad in actividades" :key="actividad.id">
          <td class="border px-2 py-1">{{ actividad.id }}</td>
          <td class="border px-2 py-1">{{ actividad.nombre }}</td>
          <td class="border px-2 py-1">{{ getTipoActividadNombre(actividad.tipoActividadId) }}</td>
          <td class="border px-2 py-1">{{ formatDate(actividad.fechaInicio) }}</td>
          <td class="border px-2 py-1">{{ actividad.cupo || '-' }}</td>
          <td class="border px-2 py-1">{{ getPeriodicidadDisplayText(actividad.periodicidad) }}</td>
          <td class="border px-2 py-1">{{ getSocioComunitarioNombre(actividad.socioComunitarioId) }}</td>
          <td class="border px-2 py-1">{{ getProyectoNombre(actividad.proyectoId) }}</td>
          <td class="border px-2 py-1">{{ actividad.creadoPorId }}</td>
          <td class="border px-2 py-1">{{ actividad.estado }}</td>
          <td class="border px-2 py-1 text-center space-x-1">
            <button @click="startEdit(actividad)" class="text-blue-600 hover:underline">Editar</button>
            <button @click="deactivateActividad(actividad.id)" class="text-red-600 hover:underline">Desactivar</button>
          </td>
        </tr>
        <tr v-if="actividades.length === 0">
          <td colspan="10" class="text-center py-4">No hay actividades registradas.</td>
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

// Declarar user y userId como referencias reactivas
const decodedInitialUser = decodeToken(token);
const user = ref(decodedInitialUser);
const userId = ref(decodedInitialUser?.userId || null);

function decodeToken(token) {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    console.log('Token decodificado (función):', decoded); // Log para depuración
    return decoded;
  } catch (e) {
    console.error('Error al decodificar el token (función):', e); // Log de error al decodificar
    return null;
  }
}

// Se ejecuta en onMounted para asegurar que el DOM esté listo y las cookies accesibles
onMounted(() => {
  console.log('Token en onMounted:', token);
  console.log('Usuario decodificado en onMounted (ref):', user.value);
  console.log('userId en onMounted (ref):', userId.value);
  fetchAllData();
});

const actividades = ref([])
const tiposActividad = ref([])
const socios = ref([])
const proyectos = ref([])
const lugares = ref([])

const opcionesPeriodicidad = [
  { value: 'Puntual', text: 'Puntual' },
  { value: 'Periódica', text: 'Periódica' }
]

function getPeriodicidadDisplayText(value) {
  const option = opcionesPeriodicidad.find(item => item.value === value);
  return option ? option.text : value;
}

const form = ref({
  // Campos de Actividad
  nombre: '',
  tipo_actividad_id: '',
  periodicidad: 'Puntual',
  cupo: null,
  socio_comunitario_id: '',
  proyecto_id: null,
  estado: 'Programada',

  // Campos para la creación de Cita (se usarán solo para NUEVAS actividades)
  lugar_id_cita: '',
  fecha_unica_cita: '', // Para periodicidad 'Puntual' o fecha de inicio para 'Periódica'
  hora_inicio_cita: '',
  hora_fin_cita: '',
  fecha_fin_periodica_citas: '' // Para periodicidad 'Periódica'
})

const editId = ref(null)
const message = ref('')
const messageClass = ref('')

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return isNaN(d) ? '' : d.toISOString().split('T')[0]
}

function getTipoActividadNombre(id) {
  const tipo = tiposActividad.value.find(t => t.id === id)
  return tipo ? tipo.nombre : 'Desconocido'
}

function getSocioComunitarioNombre(id) {
  const socio = socios.value.find(s => s.id === id)
  return socio ? socio.nombre : 'Desconocido'
}

function getProyectoNombre(id) {
  const proyecto = proyectos.value.find(p => p.id === id)
  return proyecto ? proyecto.nombre : '-'
}

function resetForm() {
  form.value = {
    nombre: '',
    tipo_actividad_id: '',
    periodicidad: 'Puntual',
    fecha_unica_cita: '',
    hora_inicio_cita: '',
    hora_fin_cita: '',
    lugar_id_cita: '',
    fecha_fin_periodica_citas: '',
    cupo: null,
    socio_comunitario_id: '',
    proyecto_id: null,
    estado: 'Programada'
  }
  editId.value = null
  message.value = ''
  messageClass.value = ''
}

async function fetchAllData() {
  try {
    const headers = { Authorization: `Bearer ${token}` }
    
    const actividadesResponse = await $fetch('/api/activities', { baseURL: config.public.API_BASE_URL, headers })
    actividades.value = actividadesResponse

    tiposActividad.value = await $fetch('/api/tipos-actividad', { baseURL: config.public.API_BASE_URL, headers })
    socios.value = await $fetch('/api/socios', { baseURL: config.public.API_BASE_URL, headers })
    proyectos.value = await $fetch('/api/proyectos', { baseURL: config.public.API_BASE_URL, headers })
    lugares.value = await $fetch('/api/lugares', { baseURL: config.public.API_BASE_URL, headers })
  } catch (e) {
    console.error('Error fetching initial data:', e)
    message.value = 'Error cargando datos iniciales'
    messageClass.value = 'bg-red-100 text-red-800'
  }
}

async function startEdit(actividad) {
  form.value = {
    ...form.value,
    nombre: actividad.nombre,
    tipo_actividad_id: actividad.tipoActividadId,
    periodicidad: actividad.periodicidad,
    fecha_unica_cita: formatDate(actividad.fechaInicio),
    cupo: actividad.cupo,
    socio_comunitario_id: actividad.socioComunitarioId,
    proyecto_id: actividad.proyectoId,
    estado: actividad.estado
  }
  editId.value = actividad.id
  message.value = ''
  messageClass.value = ''
}

async function onSubmit() {
  try {
    // Validar que el userId esté disponible para la creación de citas
    if (!editId.value && userId.value === null) {
      message.value = 'No se pudo obtener la información del usuario. Por favor, asegúrese de haber iniciado sesión.';
      messageClass.value = 'bg-red-100 text-red-800';
      console.error('Error: userId es null al intentar crear una actividad con citas.');
      return;
    }

    // CA-14: Si la actividad está "Completada", no se puede modificar desde el frontend.
    if (editId.value && form.value.estado === 'Completada') {
      message.value = 'No se puede modificar una actividad con estado "Completada".';
      messageClass.value = 'bg-red-100 text-red-800';
      return;
    }

    // Validar campos de cita solo si es una nueva actividad
    if (!editId.value) {
      if (!form.value.fecha_unica_cita || !form.value.lugar_id_cita || !form.value.hora_inicio_cita) {
        message.value = 'Los campos de Lugar, Fecha y Hora Inicio de Cita son obligatorios para nuevas actividades.';
        messageClass.value = 'bg-red-100 text-red-800';
        return;
      }
      if (form.value.periodicidad === 'Periódica' && !form.value.fecha_fin_periodica_citas) {
        message.value = 'La Fecha Fin de Citas es obligatoria para actividades Periódicas.';
        messageClass.value = 'bg-red-100 text-red-800';
        return;
      }
      if (form.value.periodicidad === 'Periódica' && new Date(form.value.fecha_unica_cita) > new Date(form.value.fecha_fin_periodica_citas)) {
        message.value = 'La Fecha Fin de Citas no puede ser anterior a la Fecha de la Cita (Inicio).';
        messageClass.value = 'bg-red-100 text-red-800';
        return;
      }
    }


    // 1. Payload para la Actividad (SOLO con campos de Actividad)
    const actividadPayload = {
      nombre: form.value.nombre,
      tipoActividadId: Number(form.value.tipo_actividad_id),
      periodicidad: form.value.periodicidad,
      fechaInicio: form.value.fecha_unica_cita, // La fechaInicio de la Actividad es la fecha de la primera cita
      fechaFin: null, // Si es puntual, fechaFin es null en Actividad. Si es periódica, se definirá en las citas
      socioComunitarioId: Number(form.value.socio_comunitario_id),
      proyectoId: form.value.proyecto_id ? Number(form.value.proyecto_id) : null,
      cupo: form.value.cupo !== null ? Number(form.value.cupo) : null,
      estado: form.value.estado,
    }

    let createdOrUpdatedActividad;
    let operationMessage = '';

    if (editId.value) {
      // Actualizar Actividad
      const response = await $fetch(`/api/activities/${editId.value}`, {
        method: 'PUT',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body: actividadPayload
      });
      createdOrUpdatedActividad = response.actividad;
      operationMessage = 'Actividad actualizada con éxito.';
    } else {
      // Crear Actividad
      const response = await $fetch('/api/activities', {
        method: 'POST',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body: actividadPayload
      });
      createdOrUpdatedActividad = response.actividad;
      operationMessage = 'Actividad creada con éxito.';

      // 2. Crear Citas (solo para nuevas actividades)
      if (createdOrUpdatedActividad && createdOrUpdatedActividad.id) {
        console.log('UserID al crear cita:', userId.value);
        let citaCreationPayload = {
          actividadId: createdOrUpdatedActividad.id,
          lugarId: Number(form.value.lugar_id_cita),
          fecha: form.value.fecha_unica_cita,
          horaInicio: form.value.hora_inicio_cita,
          horaFin: form.value.hora_fin_cita || null,
          creadoPorId: userId.value,
          periodicidadTipo: form.value.periodicidad, // Este campo ya se envía siempre
        };

        if (form.value.periodicidad === 'Puntual') {
          await $fetch('/api/citas', {
            method: 'POST',
            baseURL: config.public.API_BASE_URL,
            headers: { Authorization: `Bearer ${token}` },
            body: citaCreationPayload
          });
          operationMessage += ' Se creó 1 cita.';
        } else if (form.value.periodicidad === 'Periódica') {
          const periodicCitaPayload = {
            ...citaCreationPayload,
            fechaInicioPeriodica: form.value.fecha_unica_cita,
            fechaFinPeriodica: form.value.fecha_fin_periodica_citas || null
          };

          await $fetch('/api/citas', {
            method: 'POST',
            baseURL: config.public.API_BASE_URL,
            headers: { Authorization: `Bearer ${token}` },
            body: periodicCitaPayload
          });
          operationMessage += ' Se generaron las citas periódicas.';
        }
      }
    }

    message.value = operationMessage;
    messageClass.value = 'bg-green-100 text-green-800';
    resetForm();
    await fetchAllData();
    
    setTimeout(() => {
      router.push('/calendario-principal');
    }, 2000);
    
  } catch (error) {
    console.error('Error en onSubmit:', error);
    message.value = error?.data?.error || (error?.data?.errores ? Object.values(error.data.errores).join(', ') : 'Error en la operación');
    messageClass.value = 'bg-red-100 text-red-800';
  }
}

async function deactivateActividad(id) {
  const motivo = window.prompt('Por favor, proporciona un motivo para la cancelación:')

  if (motivo === null) {
    message.value = 'Cancelación abortada.';
    messageClass.value = 'bg-yellow-100 text-yellow-800';
    return;
  }
  if (!motivo.trim()) {
    message.value = 'Debe proporcionar un motivo para la cancelación.';
    messageClass.value = 'bg-red-100 text-red-800';
    return;
  }

  try {
    await $fetch(`/api/activities/${id}`, {
      method: 'PUT',
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
      body: { estado: 'Cancelada', motivoCancelacion: motivo }
    })
    message.value = 'Actividad desactivada correctamente';
    messageClass.value = 'bg-green-100 text-green-800';
    fetchAllData();
  } catch (error) {
    console.error('Error deactivating activity:', error);
    message.value = error?.data?.error || 'Error desactivando actividad';
    messageClass.value = 'bg-red-100 text-red-800';
  }
}
</script>

<style>
/* Estilos adicionales si son necesarios, Tailwind CSS ya proporciona la mayoría */
</style>
