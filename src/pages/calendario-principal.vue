<template>
  <Header />
  <div class="app-container">
    <header class="header">
      <h1>Centro Integral Alerce - Gestión de Actividades</h1>
    </header>

    <!-- Filtros Avanzados -->
    <section id="filtros" class="filtros">
      <select v-model="filtroTipo" class="select-filtro">
        <option value="all">Todos los tipos</option>
        <option value="reunion">Reunión</option>
        <option value="taller">Taller</option>
        <option value="actividad">Actividad</option>
      </select>

      <select v-model="filtroUsuario" class="select-filtro">
        <option value="all">Todos los usuarios</option>
        <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.nombre">{{ usuario.nombre }}</option>
      </select>

      <button @click="aplicarFiltros" class="btn btn-primary">Aplicar Filtros</button>
    </section>

    <!-- Calendario -->
    <FullCalendar
      ref="calendario"
      :options="calendarOptions"
      class="calendar"
    />

    <!-- Modal Crear Evento -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <form @submit.prevent="guardarEvento" class="modal-form">
        <h2>Nuevo Evento</h2>
        <input v-model="nuevoEvento.titulo" placeholder="Título del evento" required class="input-text" />
        <select v-model="nuevoEvento.tipo" class="select-filtro" required>
          <option value="reunion">Reunión</option>
          <option value="taller">Taller</option>
          <option value="actividad">Actividad</option>
        </select>
        <label for="inicio">Inicio:</label>
        <input id="inicio" type="datetime-local" v-model="nuevoEvento.inicio" required class="input-text" />
        <label for="fin">Fin:</label>
        <input id="fin" type="datetime-local" v-model="nuevoEvento.fin" required class="input-text" />
        <label>Usuario:</label>
        <select v-model="nuevoEvento.usuario" class="select-filtro" required>
          <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.nombre">{{ usuario.nombre }}</option>
        </select>
        <div class="modal-buttons">
          <button type="submit" class="btn btn-success">Guardar</button>
          <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Modal Ver Detalle -->
    <div v-if="eventoSeleccionado" class="modal-overlay" @click.self="eventoSeleccionado = null">
      <div class="modal-form">
        <h2>Detalle del Evento</h2>
        <p><strong>Título:</strong> {{ eventoSeleccionado.title }}</p>
        <p><strong>Tipo:</strong> {{ eventoSeleccionado.tipo }}</p>
        <p><strong>Usuario:</strong> {{ eventoSeleccionado.usuario }}</p>
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
import { ref, onMounted } from 'vue';
import { useRuntimeConfig, useCookie } from '#app';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const config = useRuntimeConfig();
const token = useCookie('token').value || '';

const filtroTipo = ref('all');
const filtroUsuario = ref('all');
const usuarios = ref([{ id: 1, nombre: 'Juan' }, { id: 2, nombre: 'Ana' }]);

const mostrarModal = ref(false);
const eventoSeleccionado = ref(null);
const nuevoEvento = ref({
  titulo: '',
  tipo: 'reunion',
  inicio: '',
  fin: '',
  usuario: 'Juan'
});

const eventosOriginales = ref([]);

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  editable: true,
  selectable: true,
  dateClick(info) {
    nuevoEvento.value.inicio = info.dateStr;
    nuevoEvento.value.fin = info.dateStr;
    mostrarModal.value = true;
  },
  eventClick(info) {
    eventoSeleccionado.value = {
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      tipo: info.event.extendedProps.tipo,
      usuario: info.event.extendedProps.usuario
    };
  },
  events: []
});

function obtenerColorPorTipo(tipo) {
  switch (tipo.toLowerCase()) {
    case 'capacitacion': return '#1B5E20';
    case 'taller': return '#2E7D32';
    case 'charla': return '#66BB6A';
    case 'atencion': return '#28A745';
    case 'operativo': return '#FFC107';
    case 'practica': return '#6F42C1';
    case 'diagnostico': return '#FD7E14';
    case 'reunion': return '#2C3E50';
    default: return '#7F8C8D';
  }
}

async function cargarEventos() {
  try {
    const data = await $fetch('/api/citas', {
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    const eventos = data.map(cita => ({
      id: cita.id,
      title: cita.actividad.nombre,
      start: cita.fecha.slice(0, 10) + 'T' + cita.horaInicio,
      end: cita.horaFin ? cita.fecha.slice(0, 10) + 'T' + cita.horaFin : null,
      tipo: cita.actividad.tipo || 'actividad',
      usuario: cita.usuario?.nombre || 'Juan',
      backgroundColor: obtenerColorPorTipo(cita.actividad.tipo || 'actividad'),
      borderColor: '#fff',
      textColor: '#fff'
    }));

    eventosOriginales.value = eventos;
    calendarOptions.value.events = eventos;
  } catch (error) {
    console.error('Error cargando citas:', error);
  }
}

function aplicarFiltros() {
  const filtrados = eventosOriginales.value.filter(evento => {
    const coincideTipo = filtroTipo.value === 'all' || evento.tipo === filtroTipo.value;
    const coincideUsuario = filtroUsuario.value === 'all' || evento.usuario === filtroUsuario.value;
    return coincideTipo && coincideUsuario;
  });
  calendarOptions.value.events = filtrados;
}

function guardarEvento() {
  const nuevo = {
    title: nuevoEvento.value.titulo,
    start: nuevoEvento.value.inicio,
    end: nuevoEvento.value.fin,
    tipo: nuevoEvento.value.tipo,
    usuario: nuevoEvento.value.usuario,
    backgroundColor: obtenerColorPorTipo(nuevoEvento.value.tipo),
    borderColor: '#fff',
    textColor: '#fff'
  };
  eventosOriginales.value.push(nuevo);
  aplicarFiltros();
  cerrarModal();
}

function cerrarModal() {
  mostrarModal.value = false;
  nuevoEvento.value = {
    titulo: '',
    tipo: 'reunion',
    inicio: '',
    fin: '',
    usuario: 'Juan'
  };
}

onMounted(() => {
  cargarEventos();
});
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
  color: #2C3E50;
  background-color: #FFFFFF;
}

.select-filtro:focus {
  border-color: #1B5E20;
  box-shadow: 0 0 5px #1B5E20AA;
}

.btn {
  cursor: pointer;
  font-family: 'Open Sans', Arial, sans-serif;
  font-size: 1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: none;
}

.btn-primary {
  background-color: #1B5E20;
  color: #FFFFFF;
}

.btn-primary:hover {
  background-color: #2E7D32;
}

.btn-success {
  background-color: #28A745;
  color: #FFFFFF;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-secondary {
  background-color: #7F8C8D;
  color: #FFFFFF;
}

.btn-secondary:hover {
  background-color: #5D6D7E;
}

.calendar {
  border-radius: 12px;
  background-color: #FFFFFF;
  box-shadow: 0 0 10px #00000011;
  padding: 1rem;
  font-family: 'Open Sans', Arial, sans-serif;
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
  font-family: 'Open Sans', Arial, sans-serif;
  color: #2C3E50;
}

.modal-form h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #1B5E20;
  font-weight: 700;
}

.input-text {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #E9ECEF;
  border-radius: 6px;
  margin-bottom: 1rem;
  outline: none;
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