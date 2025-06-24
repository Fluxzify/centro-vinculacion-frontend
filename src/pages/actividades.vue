<template>
<Header />
  <div class="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
   
    <h2 class="text-2xl font-bold mb-6 text-center">Crear Actividad</h2>
    <form @submit.prevent="submitActividad">

      <div class="mb-4">
        <label class="block font-semibold mb-1">Nombre</label>
        <input v-model="form.nombre" type="text" class="w-full border px-4 py-2 rounded" />
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">Tipo de Actividad</label>
        <select v-model="form.tipo_actividad_id" class="w-full border px-4 py-2 rounded">
          <option value="">Selecciona un tipo</option>
          <option v-for="tipo in tiposActividad" :key="tipo.id" :value="tipo.id">
            {{ tipo.nombre }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">Periodicidad</label>
        <select v-model="form.periodicidad" class="w-full border px-4 py-2 rounded">
          <option value="Puntual">Puntual</option>
          <option value="Periódica">Periódica</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1" bg->Fecha de inicio</label>
        <input v-model="form.fecha_inicio" type="date" class="w-full border px-4 py-2 rounded" />
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">Fecha de fin</label>
        <input v-model="form.fecha_fin" type="date" class="w-full border px-4 py-2 rounded" />
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">Cupo</label>
        <input v-model="form.cupo" type="number" class="w-full border px-4 py-2 rounded" />
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">Socio Comunitario</label>
        <select v-model="form.socio_comunitario_id" class="w-full border px-4 py-2 rounded">
          <option value="">Selecciona un socio</option>
          <option v-for="socio in socios" :key="socio.id" :value="socio.id">
            {{ socio.nombre }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">Proyecto (opcional)</label>
        <select v-model="form.proyecto_id" class="w-full border px-4 py-2 rounded">
          <option value="">Sin proyecto</option>
          <option v-for="proyecto in proyectos" :key="proyecto.id" :value="proyecto.id">
            {{ proyecto.nombre }}
          </option>
        </select>
      </div>

      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Guardar Actividad
      </button>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '~/components/Header.vue'

// Datos simulados — deberías cargarlos con fetch desde la API
const tiposActividad = ref([
  { id: 1, nombre: 'Charla' },
  { id: 2, nombre: 'Taller' }
])

const socios = ref([
  { id: 1, nombre: 'Junta de Vecinos' },
  { id: 2, nombre: 'Club Adulto Mayor' }
])

const proyectos = ref([
  { id: 1, nombre: 'Proyecto A' },
  { id: 2, nombre: 'Proyecto B' }
])

const form = ref({
  nombre: '',
  tipo_actividad_id: '',
  periodicidad: 'Puntual',
  fecha_inicio: '',
  fecha_fin: '',
  cupo: null,
  socio_comunitario_id: '',
  proyecto_id: null
})

const submitActividad = async () => {
  try {
    const token = localStorage.getItem('token')
   const config = useRuntimeConfig()

await $fetch('/api/actividades', {
  method: 'POST',
  baseURL: config.public.API_BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: form.value
})
    alert('Actividad creada con éxito')
  } catch (error) {
    console.error(error)
    alert('Error al crear actividad')
  }
}
</script>
