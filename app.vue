<!-- src/app.vue o layouts/default.vue -->
<template>
  <v-app>
    <NuxtLayout />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  auth.restoreToken()
})
</script>