<script setup>
import { ref, onMounted } from 'vue'
import { useCookie, useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth'
import { NuxtLink } from '#components'

const auth = useAuthStore()
const config = useRuntimeConfig()
const token = useCookie('token').value || ''

// Dropdowns
const dropdownOpen = ref(false)
let closeTimeout = null
function openDropdown() {
  userOpen.value = false
  clearTimeout(closeTimeout)
  dropdownOpen.value = true
}
function closeDropdownWithDelay() {
  clearTimeout(closeTimeout)
  closeTimeout = setTimeout(() => {
    dropdownOpen.value = false
  }, 300)
}
function cancelCloseDropdown() {
  clearTimeout(closeTimeout)
}
function closeDropdown() {
  clearTimeout(closeTimeout)
  dropdownOpen.value = false
}

const userOpen = ref(false)
let userCloseTimeout = null
function openUserDropdown() {
  dropdownOpen.value = false
  clearTimeout(userCloseTimeout)
  userOpen.value = true
}
function closeUserDropdownWithDelay() {
  clearTimeout(userCloseTimeout)
  userCloseTimeout = setTimeout(() => {
    userOpen.value = false
  }, 300)
}
function cancelCloseUserDropdown() {
  clearTimeout(userCloseTimeout)
}
function logout() {
  auth.logout()
  window.location.href = '/login'
}

// Reportes
const fechaInicio     = ref('')
const fechaFin        = ref('')
const lugarFiltro     = ref('')
const oferenteFiltro  = ref('')
const tipoFiltro      = ref('')
const actividades     = ref([])
const error           = ref('')
const loading         = ref(false)

// Datos para selects
const lugares   = ref([])
const oferentes = ref([])
const tipos     = ref([])

async function cargarCombos() {
  if (!token) {
    error.value = 'No tienes token de sesión. Por favor inicia sesión.'
    return
  }

  try {
    const [lugaresData, oferentesData, tiposData] = await Promise.all([
      $fetch('/api/lugares', {
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` }
      }),
      $fetch('/api/oferentes', {
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` }
      }),
      $fetch('/api/tipos-actividad', {
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` }
      }),
    ])

    lugares.value = lugaresData
    oferentes.value = oferentesData
    tipos.value = tiposData
  } catch (e) {
    error.value = e.message || 'Error al cargar datos'
  }
}

onMounted(() => {
  cargarCombos()
})

async function fetchActividades() {
  error.value = ''
  loading.value = true

  if (!fechaInicio.value || !fechaFin.value) {
    error.value = 'Debes ingresar fecha inicio y fin'
    loading.value = false
    return
  }

  try {
    const params = new URLSearchParams({
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      formato: 'json',
      lugar: lugarFiltro.value,
      oferente: oferenteFiltro.value,
      tipo: tipoFiltro.value
    })

    const data = await $fetch(`/api/reportes/actividades?${params}`, {
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })

    actividades.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e.message || 'Error al cargar actividades'
  } finally {
    loading.value = false
  }
}

async function descargarReporte(formato = 'pdf') {
  error.value = ''
  loading.value = true

  if (!fechaInicio.value || !fechaFin.value) {
    error.value = 'Debes ingresar fecha inicio y fin'
    loading.value = false
    return
  }

  try {
    const params = new URLSearchParams({
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      formato,
      lugar: lugarFiltro.value,
      oferente: oferenteFiltro.value,
      tipo: tipoFiltro.value
    })

    const blob = await $fetch(`/api/reportes/actividades?${params}`, {
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_actividades.${formato}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (e) {
    error.value = e.message || 'Error al descargar el reporte'
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <!-- Header -->
  <header class="bg-santotomasgreen text-white shadow">
    <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
      <h1 class="text-xl font-roboto font-bold">
        <NuxtLink to="/calendario-principal" class="text-white hover:underline">
          Centro de Vinculación
        </NuxtLink>
      </h1>
      <nav class="flex items-center space-x-6 font-open-sans relative">
        <NuxtLink to="/calendario-principal" class="text-white hover:underline">Calendario</NuxtLink>
        <NuxtLink to="/reportes" class="text-white hover:underline">Reportes</NuxtLink>

        <div class="relative" @mouseenter="openDropdown" @mouseleave="closeDropdownWithDelay">
          <button class="text-white hover:underline flex items-center">
            Mantenedores
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            v-show="dropdownOpen"
            class="absolute right-0 mt-2 w-56 bg-white text-black rounded shadow-lg z-10"
            @mouseenter="cancelCloseDropdown"
            @mouseleave="closeDropdownWithDelay"
          >
            <NuxtLink to="/socios-comunitarios" class="block px-6 py-3 hover:bg-santotomasgreen hover:text-white" @click="closeDropdown">Socios Comunitarios</NuxtLink>
            <NuxtLink to="/actividades" class="block px-6 py-3 hover:bg-santotomasgreen hover:text-white" @click="closeDropdown">Actividades</NuxtLink>
            <NuxtLink to="/proyectos" class="block px-6 py-3 hover:bg-santotomasgreen hover:text-white" @click="closeDropdown">Proyectos</NuxtLink>
            <NuxtLink to="/tipo-actividad" class="block px-6 py-3 hover:bg-santotomasgreen hover:text-white" @click="closeDropdown">Tipo de Actividad</NuxtLink>
          </div>
        </div>

        <div class="relative" @mouseenter="openUserDropdown" @mouseleave="closeUserDropdownWithDelay">
          <button class="flex items-center text-white hover:underline">
            Usuario
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <div
            v-show="userOpen"
            class="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10"
            @mouseenter="cancelCloseUserDropdown"
            @mouseleave="closeUserDropdownWithDelay"
          >
            <div class="px-4 py-3 border-b text-sm text-gray-700">Sesión iniciada</div>
            <button class="w-full text-left px-6 py-3 hover:bg-red-600 hover:text-white" @click="logout">Cerrar sesión</button>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <!-- Contenido de Reportes -->
  <div class="app-container">
    <header class="header">
      <h1>Reporte de Actividades</h1>
    </header>

    <section class="filtros">
      <input type="date" v-model="fechaInicio" class="select-filtro" />
      <input type="date" v-model="fechaFin" class="select-filtro" />

      <select v-model="lugarFiltro" class="select-filtro">
        <option value="">Todos los lugares</option>
        <option v-for="l in lugares" :key="l.id || l" :value="l.nombre || l">{{ l.nombre || l }}</option>
      </select>

      <select v-model="oferenteFiltro" class="select-filtro">
        <option value="">Todos los oferentes</option>
        <option v-for="o in oferentes" :key="o.id || o" :value="o.nombre || o">{{ o.nombre || o }}</option>
      </select>

      <select v-model="tipoFiltro" class="select-filtro">
        <option value="">Todos los tipos</option>
        <option v-for="t in tipos" :key="t.id || t" :value="t.nombre || t">{{ t.nombre || t }}</option>
      </select>

      <button @click="fetchActividades" :disabled="loading" class="btn btn-primary">Buscar</button>
      <button v-if="actividades.length" @click="descargarReporte('pdf')" class="btn btn-secondary" :disabled="loading">PDF</button>
      <button v-if="actividades.length" @click="descargarReporte('xlsx')" class="btn btn-secondary" :disabled="loading">Excel</button>
      <button v-if="actividades.length" @click="descargarReporte('csv')" class="btn btn-secondary" :disabled="loading">CSV</button>
    </section>

   <section class="resultados">
      <table class="tabla-reportes table-result" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Lugar</th>
            <th>Oferente</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="error">
            <td colspan="6" class="text-error">{{ error }}</td>
          </tr>
          <tr v-else-if="loading">
            <td colspan="6" style="text-align: center;">Cargando...</td>
          </tr>
          <tr v-else-if="!loading && actividades.length === 0">
            <td colspan="6" style="text-align: center;">No hay resultados</td>
          </tr>
          <tr v-else v-for="actividad in actividades" :key="actividad.id">
            <td>{{ actividad.fecha }}</td>
            <td>{{ actividad.lugar }}</td>
            <td>{{ actividad.oferente }}</td>
            <td>{{ actividad.tipo }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.header h1 {
  margin-bottom: 1rem;
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  font-size: 1.8rem;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.select-filtro {
  flex: 1 1 150px;
  padding: 0.4rem 0.6rem;
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: #28a745;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #218838;
}

.btn-secondary {
  background-color: #007bff;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #0069d9;
}

.btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.resultados {
  margin-top: 2rem;
}

.table-result th,
.table-result td {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
}

.table-result th {
  background-color: #f8f9fa;
  font-weight: 600;
  text-align: left;
}

.text-error {
  color: red;
  font-weight: bold;
  text-align: center;
}
</style>
