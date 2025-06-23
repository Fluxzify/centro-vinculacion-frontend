<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-3xl font-bold mb-4">Bienvenido al Calendario Principal</h1>
      <p class="text-gray-700 mb-6">
        Aquí puedes ver tus próximas citas, eventos o tareas programadas.
      </p>

      <!-- Calendario o listado de eventos -->
      <div class="space-y-4">
        <div class="bg-blue-100 p-4 rounded-md">
          <h2 class="font-semibold text-lg">📅 Reunión con equipo</h2>
          <p class="text-gray-600">Lunes 24 de junio, 10:00 AM</p>
        </div>
        <div class="bg-green-100 p-4 rounded-md">
          <h2 class="font-semibold text-lg">📝 Entrega de informe</h2>
          <p class="text-gray-600">Martes 25 de junio, 5:00 PM</p>
        </div>
        <div class="bg-yellow-100 p-4 rounded-md">
          <h2 class="font-semibold text-lg">💻 Taller de capacitación</h2>
          <p class="text-gray-600">Viernes 28 de junio, 3:00 PM</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Aquí más adelante puedes cargar eventos dinámicos si los tienes en tu backend
</script>