<template>
  <Header />
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

    <form @submit.prevent="onSubmit" class="mb-6 p-4 border rounded shadow">
      <h2 class="text-xl mb-2">{{ editId ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>

      <input
        v-model="nombre"
        type="text"
        placeholder="Nombre del usuario"
        class="border p-2 rounded w-full mb-2"
        required
      />

      <input
        v-model="email"
        type="email"
        placeholder="Correo electrónico"
        class="border p-2 rounded w-full mb-2"
        required
      />

      <input
        v-model="password"
        type="password"
        placeholder="Contraseña"
        class="border p-2 rounded w-full mb-2"
        :required="!editId"
      />

      <div class="mb-4">
        <h3 class="font-semibold mb-2">Permisos:</h3>
        <div v-for="permiso in permisosDisponibles" :key="permiso.id" class="mb-1">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              :value="permiso.id"
              v-model="permisosSeleccionados"
              class="mr-2"
            />
            {{ permiso.nombre }}
          </label>
        </div>
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
          <th class="border px-4 py-2 text-left">Email</th>
          <th class="border px-4 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in usuarios" :key="usuario.id">
          <td class="border px-4 py-2">{{ usuario.id }}</td>
          <td class="border px-4 py-2">{{ usuario.nombre }}</td>
          <td class="border px-4 py-2">{{ usuario.email }}</td>
          <td class="border px-4 py-2 text-center space-x-2">
            <button @click="startEdit(usuario)" class="text-blue-600 hover:underline">Editar</button>
            <button @click="deleteUsuario(usuario.id)" class="text-red-600 hover:underline">Eliminar</button>
          </td>
        </tr>
        <tr v-if="usuarios.length === 0">
          <td colspan="4" class="text-center py-4">No hay usuarios registrados.</td>
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

const usuarios = ref([])
const permisosDisponibles = ref([])
const permisosSeleccionados = ref([])

const nombre = ref('')
const email = ref('')
const password = ref('')
const editId = ref(null)
const message = ref('')
const messageClass = ref('')

async function fetchUsuarios() {
  try {
    const data = await $fetch('/api/users', {
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    usuarios.value = data
  } catch {
    message.value = 'Error cargando usuarios'
    messageClass.value = 'text-red-600'
  }
}

async function fetchPermisos() {
  try {
    const data = await $fetch('/api/permissions', {
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    permisosDisponibles.value = data.map(p => ({
      id: p,
      nombre: convertirANombreLegible(p)
    }))
  } catch {
    message.value = 'Error cargando permisos'
    messageClass.value = 'text-red-600'
  }
}

function convertirANombreLegible(permiso) {
  return permiso.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function resetForm() {
  nombre.value = ''
  email.value = ''
  password.value = ''
  editId.value = null
  permisosSeleccionados.value = []
}

function startEdit(usuario) {
  nombre.value = usuario.nombre
  email.value = usuario.email
  password.value = ''
  editId.value = usuario.id
  permisosSeleccionados.value = usuario.permisos || []
  message.value = ''
  messageClass.value = ''
}

function cancelEdit() {
  resetForm()
  message.value = ''
  messageClass.value = ''
}

async function onSubmit() {
  if (!nombre.value.trim() || !email.value.trim()) {
    message.value = 'Nombre y correo electrónico son obligatorios'
    messageClass.value = 'text-red-600'
    return
  }

  try {
    const body = {
      nombre: nombre.value,
      email: email.value,
      permisos: permisosSeleccionados.value
    }

    if (password.value) {
      body.password = password.value
    }

    let usuarioIdCreado = null

    if (editId.value) {
      await $fetch(`/api/users/${editId.value}`, {
        method: 'PUT',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body
      })
      usuarioIdCreado = editId.value
      message.value = 'Usuario actualizado con éxito'
    } else {
      const nuevoUsuario = await $fetch('/api/users', {
        method: 'POST',
        baseURL: config.public.API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
        body
      })
      usuarioIdCreado = nuevoUsuario.id
      message.value = 'Usuario creado con éxito'
    }

    messageClass.value = 'text-green-600'

    if (usuarioIdCreado && permisosSeleccionados.value.length > 0) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const asignadoPorId = payload.userId

      for (const permiso of permisosSeleccionados.value) {
        await $fetch('/api/permisousuario', {
          method: 'POST',
          baseURL: config.public.API_BASE_URL,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            usuarioId: usuarioIdCreado,
            permiso,
            asignadoPorId
          }
        })
      }
    }

    resetForm()
    fetchUsuarios()
  } catch (error) {
    message.value = error?.data?.error || 'Error en la operación'
    messageClass.value = 'text-red-600'
  }
}

async function deleteUsuario(id) {
  if (!confirm('¿Seguro quieres eliminar este usuario?')) return

  try {
    await $fetch(`/api/users/${id}`, {
      method: 'DELETE',
      baseURL: config.public.API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    message.value = 'Usuario eliminado con éxito'
    messageClass.value = 'text-green-600'
    fetchUsuarios()
  } catch (error) {
    message.value = error?.data?.error || 'Error eliminando usuario'
    messageClass.value = 'text-red-600'
  }
}

onMounted(() => {
  fetchUsuarios()
  fetchPermisos()
})
</script>
