<template>
  <v-container
    class="fill-height"
    fluid
    align="center"
    justify="center"
    style="background-color: #E8F5E8;"  <!-- Verde Claro fondo -->
  >
    <v-card
      max-width="400"
      class="pa-6"
      elevation="8"
      style="background-color: #FFFFFF;"  <!-- Blanco -->
    >
      <v-card-title class="text-h4 text-center font-weight-bold" style="color: #1B5E20;">
        Restablecer contraseña
      </v-card-title>

      <v-form @submit.prevent="resetPassword" ref="formRef" v-model="valid">
        <v-text-field
          v-model="newPassword"
          :rules="[rules.required]"
          label="Nueva contraseña"
          type="password"
          outlined
          color="primary"
          dense
          class="mb-4"
        />

        <v-text-field
          v-model="confirmPassword"
          :rules="[rules.required, matchPassword]"
          label="Confirmar contraseña"
          type="password"
          outlined
          color="primary"
          dense
          class="mb-6"
        />

        <v-btn
          type="submit"
          color="primary"
          class="white--text"
          block
          :disabled="!valid"
          elevation="2"
          style="background-color: #1B5E20;"
          :loading="loading"
        >
          Cambiar contraseña
        </v-btn>
      </v-form>

      <v-alert
        v-if="error"
        type="error"
        class="mt-4"
        border="left"
        colored-border
        elevation="2"
        dense
      >
        {{ error }}
      </v-alert>

      <v-alert
        v-if="success"
        type="success"
        class="mt-4"
        border="left"
        colored-border
        elevation="2"
        dense
      >
        {{ success }}
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const email = String(route.query.email || '')
const token = String(route.query.token || '')

const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const valid = ref(false)
const formRef = ref(null)

const rules = {
  required: (v) => (!!v && v.length > 0) || 'Por favor completa este campo',
}

const matchPassword = (v) =>
  v === newPassword.value || 'Las contraseñas no coinciden'

const resetPassword = async () => {
  error.value = ''
  success.value = ''

  if (!formRef.value.validate()) return

  loading.value = true

  try {
  const config = useRuntimeConfig()

await $fetch('/api/auth/reset-password', {
  method: 'POST',
  baseURL: config.public.API_BASE_URL,
  body: {
    email,
    token,
    newPassword: newPassword.value
  }
})

    success.value = 'Contraseña actualizada correctamente. Redirigiendo al login...'
    setTimeout(() => {
      router.push('/login')
    }, 2500)
  } catch (e) {
    error.value = e?.data?.error || 'Hubo un problema al actualizar la contraseña'
  } finally {
    loading.value = false
  }
}
</script>
