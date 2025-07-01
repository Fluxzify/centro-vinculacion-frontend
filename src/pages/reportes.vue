<script setup>
import { ref } from 'vue'
import { useCookie, useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth'

const config = useRuntimeConfig()
const auth = useAuthStore()

// Dropdown Mantenedores
const dropdownOpen = ref(false)
let closeTimeout = null
const openDropdown = () => {
  if (userOpen.value) userOpen.value = false
  if (closeTimeout) clearTimeout(closeTimeout)
  dropdownOpen.value = true
}
const closeDropdownWithDelay = () => {
  closeTimeout = setTimeout(() => {
    dropdownOpen.value = false
    closeTimeout = null
  }, 300)
}
const cancelCloseDropdown = () => {
  if (closeTimeout) clearTimeout(closeTimeout)
}
const closeDropdown = () => {
  if (closeTimeout) clearTimeout(closeTimeout)
  dropdownOpen.value = false
}

// Dropdown Usuario
const userOpen = ref(false)
let userCloseTimeout = null
const openUserDropdown = () => {
  if (dropdownOpen.value) dropdownOpen.value = false
  if (userCloseTimeout) clearTimeout(userCloseTimeout)
  userOpen.value = true
}
const closeUserDropdownWithDelay = () => {
  userCloseTimeout = setTimeout(() => {
    userOpen.value = false
    userCloseTimeout = null
  }, 300)
}
const cancelCloseUserDropdown = () => {
  if (userCloseTimeout) clearTimeout(userCloseTimeout)
}
function logout() {
  auth.logout()
  window.location.href = '/login'
}

// Reportes
const fechaInicio  = ref('')
const fechaFin     = ref('')
const actividades  = ref([])
const error        = ref('')
const loading      = ref(false)

async function fetchActividades() {
  error.value   = ''
  loading.value = true

  if (!fechaInicio.value || !fechaFin.value) {
    error.value   = 'Debes ingresar fecha inicio y fin'
    loading.value = false
    return
  }

  const token = useCookie('token').value || ''
  if (!token) {
    error.value   = 'No tienes token de sesión. Por favor inicia sesión.'
    loading.value = false
    return
  }

  try {
    const headers = { Authorization: `Bearer ${token}` }
    const query = {
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      formato: 'json'
    }

    const data = await $fetch('/api/reportes/actividades', {
      baseURL: config.public.API_BASE_URL,
      method: 'GET',
      headers,
      query
    })

    actividades.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e.message || 'Error al cargar actividades'
  } finally {
    loading.value = false
  }
}

async function descargarReporte(formato = 'pdf') {
  error.value   = ''
  loading.value = true

  if (!fechaInicio.value || !fechaFin.value) {
    error.value   = 'Debes ingresar fecha inicio y fin'
    loading.value = false
    return
  }

  const token = useCookie('token').value || ''
  if (!token) {
    error.value   = 'No tienes token de sesión. Por favor inicia sesión.'
    loading.value = false
    return
  }

  try {
    const headers = { Authorization: `Bearer ${token}` }
    const query = {
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      formato
    }

    const blob = await $fetch('/api/reportes/actividades', {
      baseURL: config.public.API_BASE_URL,
      method: 'GET',
      headers,
      query,
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
    error.value = e.message || 'Error al descargar reporte'
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
        <NuxtLink to="/calendario-principal" class="text-white hover:underline">
          Calendario
        </NuxtLink>
        <NuxtLink to="/reportes" class="text-white hover:underline">
          Reportes
        </NuxtLink>
        <div class="relative" @mouseenter="openDropdown" @mouseleave="closeDropdownWithDelay">
          <button class="text-white hover:underline flex items-center">
            Mantenedores
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="dropdownOpen" class="absolute right-0 mt-2 w-56 bg-white text-black rounded shadow-lg z-10"
               @mouseenter="cancelCloseDropdown" @mouseleave="closeDropdownWithDelay">
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
          <div v-show="userOpen" class="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10"
               @mouseenter="cancelCloseUserDropdown" @mouseleave="closeUserDropdownWithDelay">
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
      <button @click="fetchActividades" :disabled="loading" class="btn btn-primary">Buscar</button>
      <button v-if="actividades.length" @click="descargarReporte('pdf')" class="btn btn-secondary" :disabled="loading">PDF</button>
      <button v-if="actividades.length" @click="descargarReporte('xlsx')" class="btn btn-secondary" :disabled="loading">Excel</button>
      <button v-if="actividades.length" @click="descargarReporte('csv')" class="btn btn-secondary" :disabled="loading">CSV</button>
    </section>

    <p v-if="error" class="text-error">{{ error }}</p>

    <div v-if="actividades.length" class="tabla-container">
      <table class="table-result">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Lugar</th>
            <th>Oferente</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="act in actividades" :key="act.id">
            <td>{{ act.fecha }}</td>
            <td>{{ act.titulo }}</td>
            <td>{{ act.tipo }}</td>
            <td>{{ act.lugar }}</td>
            <td>{{ act.oferente }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans&family=Roboto&display=swap');

.bg-santotomasgreen { background-color: #1B5E20; }
.font-roboto { font-family: 'Roboto', sans-serif; }
.font-open-sans { font-family: 'Open Sans', sans-serif; }

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

.text-error {
  color: #dc2626;
  margin-bottom: 1rem;
}

.tabla-container {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 1rem;
}

.table-result {
  width: 100%;
  border-collapse: collapse;
}

.table-result th,
.table-result td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #E9ECEF;
  text-align: left;
}

.table-result thead {
  background-color: #F1F8F1;
}

.table-result th {
  color: #1B5E20;
  font-weight: 600;
}

/* Dropdown styles are inherited from header code */
</style>
