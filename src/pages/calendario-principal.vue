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

    <!-- Modal Crear Evento -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <form @submit.prevent="guardarEvento" class="modal-form">
        <h2>Nuevo Evento</h2>
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
        <input type="datetime-local" v-model="nuevoEvento.inicio" required class="input-text" />
        <label>Fin:</label>
        <input type="datetime-local" v-model="nuevoEvento.fin" required class="input-text" />

        <div class="modal-buttons">
          <button type="submit" class="btn btn-success">Guardar</button>
          <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Modal Detalle Evento -->
    <div v-if="eventoSeleccionado" class="modal-overlay" @click.self="eventoSeleccionado = null">
      <div class="modal-form">
        <h2>Detalle del Evento</h2>
        <p><strong>Título:</strong> {{ eventoSeleccionado.title }}</p>
        <p><strong>Tipo:</strong> {{ eventoSeleccionado.tipo }}</p>
        <p><strong>Inicio:</strong> {{ eventoSeleccionado.start }}</p>
        <p><strong>Fin:</strong> {{ eventoSeleccionado.end || 'No definido' }}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" @click="eventoSeleccionado = null">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
const eventoSeleccionado = ref(null)
const calendario = ref(null)
const tiposActividad = ref([])
const tiposDisponibles = ref([])
const actividades = ref([])
const lugares = ref([])
const userId = ref(null)

const nuevoEvento = ref({
  titulo: '',
  tipo: 'actividad',
  inicio: '',
  fin: '',
  actividadId: '',
  lugarId: ''
})

const eventosOriginales = ref([])

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: vistaActual.value,
  editable: true,
  selectable: true,
  dayMaxEvents: true,
  height: 'auto',
  dateClick(info) {
    nuevoEvento.value.inicio = info.dateStr
    nuevoEvento.value.fin = info.dateStr
    mostrarModal.value = true
  },
  eventClick(info) {
    eventoSeleccionado.value = {
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      tipo: info.event.extendedProps.tipo
    }
  },
  eventDrop: async (info) => {
    const evento = info.event
    const id = evento.id
    const fecha = evento.startStr.slice(0, 10)
    const horaInicio = evento.startStr.slice(11, 16)
    const horaFin = evento.endStr ? evento.endStr.slice(11, 16) : null

    console.log('Actualizando cita arrastrada', { id, fecha, horaInicio, horaFin, token })

    if (!token) {
      console.error('Token no disponible para actualizar cita')
      info.revert()
      return
    }

    try {
      await $fetch(`/api/citas/${id}`, {
        method: 'PUT',
        baseURL: config.public.API_BASE_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          fecha,
          horaInicio,
          horaFin,
          modificadoPorId: userId.value
        }
      })
      await cargarEventos()
    } catch (e) {
      console.error('Error actualizando cita arrastrada', e)
      info.revert()
    }
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
      id: String(cita.id),
      title: cita.actividad.nombre,
      start: `${cita.fecha.slice(0, 10)}T${cita.horaInicio}`,
      end: cita.horaFin ? `${cita.fecha.slice(0, 10)}T${cita.horaFin}` : null,
      extendedProps: { tipo: tipoMap[cita.actividad.tipoActividadId] || 'actividad' },
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

    const payload = {
      actividadId: Number(nuevoEvento.value.actividadId),
      lugarId: Number(nuevoEvento.value.lugarId),
      fecha: nuevoEvento.value.inicio.slice(0, 10),
      horaInicio: nuevoEvento.value.inicio.slice(11, 16),
      horaFin: nuevoEvento.value.fin.slice(11, 16),
      creadoPorId: userId.value,
      periodicidadTipo: 'Puntual'
    }

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    await $fetch('/api/citas', {
      method: 'POST',
      baseURL: config.public.API_BASE_URL,
      headers,
      body: payload
    })

    mostrarModal.value = false
    await cargarEventos()
  } catch (e) {
    console.error('Error guardando evento:', e)
    alert('Error al guardar la cita.')
  }
}

function cerrarModal() {
  mostrarModal.value = false
  nuevoEvento.value = { titulo: '', tipo: 'actividad', inicio: '', fin: '', actividadId: '', lugarId: '' }
}

function aplicarFiltros() {
  const api = calendario.value.getApi()
  api.removeAllEvents()
  eventosOriginales.value.filter(e => filtroTipo.value === 'all' || e.extendedProps.tipo === filtroTipo.value).forEach(ev => api.addEvent(ev))
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

import { onActivated } from 'vue'
onActivated(cargarEventos)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans&family=Roboto&display=swap');

.app-container {
  font-family: 'Roboto', Arial, sans-serif;
  color: #2C3E50;
  background-color: #E8F5E8;
  min-height: 100vh;
  padding: 1rem 2rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #1B5E20;
  font-weight: 700;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.select-filtro {
  font-family: 'Open Sans', Arial, sans-serif;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid #E9ECEF;
  border-radius: 6px;
  background-color: #FFFFFF;
  color: #2C3E50;
}

.select-filtro:focus {
  border-color: #1B5E20;
  box-shadow: 0 0 5px #1B5E20AA;
}

.btn {
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: none;
  font-family: 'Open Sans', Arial, sans-serif;
}

.btn-primary {
  background-color: #1B5E20;
  color: #FFFFFF;
}

.btn-primary:hover {
  background-color: #2E7D32;
}

.btn-secondary {
  background-color: #7F8C8D;
  color: #FFFFFF;
}

.btn-secondary:hover {
  background-color: #5D6D7E;
}

.btn-success {
  background-color: #28A745;
  color: #FFFFFF;
}

.btn-success:hover {
  background-color: #218838;
}

.calendar {
  border-radius: 12px;
  background-color: #FFFFFF;
  box-shadow: 0 0 10px #00000011;
  padding: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(27, 94, 32, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-form {
  background: #FFFFFF;
  padding: 2rem;
  border-radius: 12px;
  min-width: 320px;
  max-width: 500px;
  box-shadow: 0 0 15px #1B5E2099;
}

.modal-form h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #1B5E20;
}

.input-text {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #E9ECEF;
  border-radius: 6px;
  margin-bottom: 1rem;
  color: #2C3E50;
}

.input-text:focus {
  border-color: #1B5E20;
  box-shadow: 0 0 5px #1B5E20AA;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>