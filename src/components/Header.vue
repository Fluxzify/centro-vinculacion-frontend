<template>
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

        <!-- Nueva opción: Reportes -->
        <NuxtLink to="/reportes" class="text-white hover:underline">
          Reportes
        </NuxtLink>

        <!-- Dropdown Mantenedores -->
        <div
          class="relative"
          @mouseenter="openDropdown"
          @mouseleave="closeDropdownWithDelay"
        >
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
            <NuxtLink
              to="/socios-comunitarios"
              class="block px-6 py-3 hover:bg-santotomasgreen hover:text-white"
              @click="closeDropdown"
            >
              Socios Comunitarios
            </NuxtLink>
            <NuxtLink
              to="/actividades"
              class="block px-6 py-3 hover:bg-santotomasgreen hover:text-white"
              @click="closeDropdown"
            >
              Actividades
            </NuxtLink>
            <NuxtLink
              to="/proyectos"
              class="block px-6 py-3 hover:bg-santotomasgreen hover:text-white"
              @click="closeDropdown"
            >
              Proyectos
            </NuxtLink>
            <NuxtLink
              to="/tipo-actividad"
              class="block px-6 py-3 hover:bg-santotomasgreen hover:text-white"
              @click="closeDropdown"
            >
              Tipo de Actividad
            </NuxtLink>
             <NuxtLink
              to="/oferentes"
              class="block px-6 py-3 hover:bg-santotomasgreen hover:text-white"
              @click="closeDropdown"
            >
              Oferentes
            </NuxtLink>
               <NuxtLink
              to="/lugares"
              class="block px-6 py-3 hover:bg-santotomasgreen hover:text-white"
              @click="closeDropdown"
            >
              Lugares
            </NuxtLink>
          </div>
        </div>

        <!-- Dropdown Usuario -->
        <div
          class="relative"
          @mouseenter="openUserDropdown"
          @mouseleave="closeUserDropdownWithDelay"
        >
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
            <div class="px-4 py-3 border-b text-sm text-gray-700">
              Sesión iniciada
            </div>
            <button
              class="w-full text-left px-6 py-3 hover:bg-red-600 hover:text-white"
              @click="logout"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

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
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
}

const closeDropdown = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
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
  if (userCloseTimeout) {
    clearTimeout(userCloseTimeout)
    userCloseTimeout = null
  }
}

function logout() {
  auth.logout()
  window.location.href = '/login'
}
</script>
