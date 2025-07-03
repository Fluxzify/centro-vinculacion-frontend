<template>
  <Header />
  <div class="app-container">
    <header class="header">
      <h1>Centro Integral Alerce - Gestión de Actividades</h1>
    </header>

    <!-- Filtros y Controles -->
    <section class="filtros">
      <select v-model="filtroTipo" class="select-filtro">
        <option value="all">Todos los tipos</option>
        <option v-for="tipo in tiposDisponibles" :key="tipo" :value="tipo">
          {{ tipo.charAt(0).toUpperCase() + tipo.slice(1) }}
        </option>
      </select>

      <select v-model="vistaActual" @change="cambiarVista" class="select-filtro">
        <option value="timeGridWeek">Vista Semanal</option>
        <option value="dayGridMonth">Vista Mensual</option>
      </select>

      <button @click="aplicarFiltros" class="btn btn-primary">Aplicar Filtros</button>
      <button @click="irAFecha('prev')" class="btn btn-secondary">← Anterior</button>
      <button @click="irAFecha('today')" class="btn btn-secondary">Hoy</button>
      <button @click="irAFecha('next')" class="btn btn-secondary">Siguiente →</button>
    </section>

    <!-- Calendario -->
    <FullCalendar ref="calendario" :options="calendarOptions" class="calendar" />

    <!-- Modal Crear/Editar Evento -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <form @submit.prevent="guardarEvento" class="modal-form">
        <h2>{{ nuevoEvento.id ? 'Editar Evento' : 'Nuevo Evento' }}</h2>
        <input v-model="nuevoEvento.titulo" placeholder="Título del evento" required class="input-text" />

        <select v-model="nuevoEvento.tipo" class="select-filtro" required>
          <option v-for="tipo in tiposDisponibles" :key="tipo" :value="tipo">
            {{ tipo.charAt(0).toUpperCase() + tipo.slice(1) }}
          </option>
        </select>

        <select v-model="nuevoEvento.actividadId" class="select-filtro" required>
          <option disabled value="">Selecciona una Actividad</option>
          <option v-for="actividad in actividades" :key="actividad.id" :value="actividad.id">
            {{ actividad.nombre }}
          </option>
        </select>

        <select v-model="nuevoEvento.lugarId" class="select-filtro" required>
          <option disabled value="">Selecciona un Lugar</option>
          <option v-for="lugar in lugares" :key="lugar.id" :value="lugar.id">
            {{ lugar.nombre }}
          </option>
        </select>

        <label>Inicio:</label>
        <input
          type="datetime-local"
          v-model="nuevoEvento.inicio"
          required
          class="input-text"
        />
        <label>Fin:</label>
        <input
          type="datetime-local"
          v-model="nuevoEvento.fin"
          class="input-text"
        />

        <div class="modal-buttons">
          <button type="submit" class="btn btn-success">Guardar</button>
          <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
          <button v-if="nuevoEvento.id" type="button" @click="eliminarEvento" class="btn btn-danger">Eliminar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRuntimeConfig, useCookie } from '#app'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const config = useRuntimeConfig()
const token = useCookie('token').value || ''

const filtroTipo = ref('all')
const vistaActual = ref('timeGridWeek')
const mostrarModal = ref(false)
const calendario = ref(null)
const tiposActividad = ref([])
const tiposDisponibles = ref([])
const actividades = ref([])
const lugares = ref([])
const userId = ref(null)

const nuevoEvento = ref({
  id: null,
  titulo: '',
  tipo: 'actividad',
  inicio: '',
  fin: '',
  actividadId: '',
  lugarId: ''
})

const eventosOriginales = ref([])

// Función para convertir ISO con zona horaria a formato válido para datetime-local
function formatearParaDatetimeLocal(fechaISOConZona) {
  if (!fechaISOConZona) return ''
  const fecha = new Date(fechaISOConZona)
  const yyyy = fecha.getFullYear()
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  const dd = String(fecha.getDate()).padStart(2, '0')
  const hh = String(fecha.getHours()).padStart(2, '0')
  const min = String(fecha.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: vistaActual.value,
  editable: true,
  selectable: true,
  dayMaxEvents: true,
  height: 'auto',

  dateClick(info) {
    // Al crear nuevo evento, inicializar inicio y fin con formato correcto para datetime-local
    const fechaStr = formatearParaDatetimeLocal(info.date.toISOString())
    nuevoEvento.value = {
      id: null,
      titulo: '',
      tipo: 'actividad',
      inicio: fechaStr,
      fin: fechaStr,
      actividadId: '',
      lugarId: ''
    }
    mostrarModal.value = true
  },

  eventClick(info) {
    const evento = info.event
    nuevoEvento.value = {
      id: evento.id,
      titulo: evento.title,
      tipo: evento.extendedProps.tipo,
      inicio: formatearParaDatetimeLocal(evento.start.toISOString()),
      fin: evento.end ? formatearParaDatetimeLocal(evento.end.toISOString()) : '',
      actividadId: evento.extendedProps.actividadId,
      lugarId: evento.extendedProps.lugarId
    }
    mostrarModal.value = true
  },

  eventDrop(info) {
    if (!confirm('¿Deseas mover este evento a otra fecha/hora?')) {
      info.revert()
      return
    }

    const evento = info.event

    const nuevaFecha = evento.startStr.slice(0, 10)
    const nuevaHoraInicio = evento.startStr.slice(11, 16)
    const nuevaHoraFin = evento.endStr ? evento.endStr.slice(11, 16) : null

    const headers = { Authorization: `Bearer ${token}` }

    $fetch(`/api/citas/${evento.id}`, {
      method: 'PUT',
      baseURL: config.public.API_BASE_URL,
      headers,
      body: {
        fecha: nuevaFecha,
        horaInicio: nuevaHoraInicio,
        horaFin: nuevaHoraFin
      }
    }).catch(error => {
      console.error('Error actualizando evento:', error)
      alert('Error al actualizar el evento.')
      info.revert()
    })
  },

  events: []
})

function obtenerColorPorTipo(tipo) {
  switch (tipo.toLowerCase()) {
    case 'capacitacion': return '#1B5E20'
    case 'taller': return '#2E7D32'
    case 'charla': return '#66BB6A'
    case 'atencion': return '#28A745'
    case 'operativo': return '#FFC107'
    case 'practica': return '#6F42C1'
    case 'diagnostico': return '#FD7E14'
    case 'reunion': return '#2C3E50'
    default: return '#7F8C8D'
  }
}

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

async function cargarEventos() {
  try {
    const headers = { Authorization: `Bearer ${token}` }

    tiposActividad.value = await $fetch('/api/tipos-actividad', { baseURL: config.public.API_BASE_URL, headers })
    tiposDisponibles.value = tiposActividad.value.map(t => t.nombre.toLowerCase()).sort()

    const data = await $fetch('/api/citas', { baseURL: config.public.API_BASE_URL, headers })

    const tipoMap = {}
    tiposActividad.value.forEach(t => {
      tipoMap[t.id] = t.nombre.toLowerCase()
    })

    const eventos = data.map(cita => ({
      id: cita.id,
      title: cita.actividad.nombre,
      start: `${cita.fecha.slice(0,10)}T${cita.horaInicio}`,
      end: cita.horaFin ? `${cita.fecha.slice(0,10)}T${cita.horaFin}` : null,
      tipo: tipoMap[cita.actividad.tipoActividadId] || 'actividad',
      actividadId: cita.actividadId,
      lugarId: cita.lugarId,
      backgroundColor: obtenerColorPorTipo(tipoMap[cita.actividad.tipoActividadId] || ''),
      borderColor: '#fff',
      textColor: '#fff'
    }))

    eventosOriginales.value = eventos

    const api = calendario.value.getApi()
    api.removeAllEvents()
    eventos.forEach(ev => api.addEvent(ev))
  } catch (error) {
    console.error('Error cargando eventos:', error)
  }
}

async function cargarActividadesYLugares() {
  const headers = { Authorization: `Bearer ${token}` }
  actividades.value = await $fetch('/api/activities', { baseURL: config.public.API_BASE_URL, headers })
  lugares.value = await $fetch('/api/lugares', { baseURL: config.public.API_BASE_URL, headers })
}

async function guardarEvento() {
  try {
    if (!userId.value) throw new Error('Usuario no identificado')

    // Preparar payload para API con formato correcto
    const payload = {
      actividadId: Number(nuevoEvento.value.actividadId),
      lugarId: Number(nuevoEvento.value.lugarId),
      fecha: nuevoEvento.value.inicio.slice(0, 10),
      horaInicio: nuevoEvento.value.inicio.slice(11, 16),
      horaFin: nuevoEvento.value.fin ? nuevoEvento.value.fin.slice(11, 16) : null,
      creadoPorId: userId.value,
      periodicidadTipo: 'Puntual'
    }

    const headers = { Authorization: `Bearer ${token}` }

    if (nuevoEvento.value.id) {
      await $fetch(`/api/citas/${nuevoEvento.value.id}`, {
        method: 'PUT',
        baseURL: config.public.API_BASE_URL,
        headers,
        body: payload
      })
    } else {
      await $fetch('/api/citas', {
        method: 'POST',
        baseURL: config.public.API_BASE_URL,
        headers,
        body: payload
      })
    }

    cerrarModal()
    await cargarEventos()
  } catch (e) {
    console.error('Error guardando evento:', e)
    alert('Error al guardar la cita.')
  }
}

async function eliminarEvento() {
  if (!nuevoEvento.value.id || !confirm('¿Deseas eliminar este evento?')) return

  const headers = { Authorization: `Bearer ${token}` }

  try {
    await $fetch(`/api/citas/${nuevoEvento.value.id}`, {
      method: 'DELETE',
      baseURL: config.public.API_BASE_URL,
      headers
    })
    cerrarModal()
    await cargarEventos()
  } catch (error) {
    console.error('Error eliminando evento:', error)
    alert('No se pudo eliminar el evento.')
  }
}

function cerrarModal() {
  mostrarModal.value = false
  nuevoEvento.value = {
    id: null,
    titulo: '',
    tipo: 'actividad',
    inicio: '',
    fin: '',
    actividadId: '',
    lugarId: ''
  }
}

function aplicarFiltros() {
  const api = calendario.value.getApi()
  api.removeAllEvents()
  eventosOriginales.value.filter(e => filtroTipo.value === 'all' || e.tipo === filtroTipo.value).forEach(ev => api.addEvent(ev))
}

function cambiarVista() {
  calendario.value.getApi().changeView(vistaActual.value)
}

function irAFecha(dir) {
  const api = calendario.value.getApi()
  if (dir === 'prev') api.prev()
  else if (dir === 'next') api.next()
  else api.today()
}

onMounted(() => {
  cargarEventos()
  cargarActividadesYLugares()

  const decoded = decodeToken(token)
  if (decoded?.userId) {
    userId.value = decoded.userId
  }
})

onActivated(cargarEventos)
</script>
