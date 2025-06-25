import { defineStore } from 'pinia'
import { useCookie, useRuntimeConfig } from '#app'
import { jwtDecode } from 'jwt-decode'

type TokenPayload = {
  nombre: string
  userId: number
  // Agrega más campos si tu token los tiene
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    nombre: null as string | null
  }),

  actions: {
    async login(email: string, password: string) {
      const config = useRuntimeConfig()

      try {
        const data = await $fetch<{ token: string }>('/api/auth/login', {
          method: 'POST',
          baseURL: config.public.API_BASE_URL,
          body: { email, password },
          credentials: 'include'
        })

        if (!data.token) throw new Error('Credenciales incorrectas')

        const tokenCookie = useCookie('token', { maxAge: 60 * 60 * 24 * 7 })
        tokenCookie.value = data.token
        this.token = data.token

        const payload = jwtDecode<TokenPayload>(data.token)
        this.nombre = payload.nombre
      } catch (error: any) {
        throw new Error(error?.data?.message || 'Credenciales incorrectas')
      }
    },

    async register(nombre: string, email: string, password: string) {
      const config = useRuntimeConfig()

      try {
        const data = await $fetch<{ token: string }>('/api/auth/register', {
          method: 'POST',
          baseURL: config.public.API_BASE_URL,
          body: { nombre, email, password },
          credentials: 'include'
        })

        const tokenCookie = useCookie('token', { maxAge: 60 * 60 * 24 * 7 })
        tokenCookie.value = data.token
        this.token = data.token

        const payload = jwtDecode<TokenPayload>(data.token)
        this.nombre = payload.nombre
      } catch (error: any) {
        const backendMessage =
          error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          'Error desconocido al registrarse'

        throw new Error(backendMessage)
      }
    },

    logout() {
      useCookie('token').value = null
      this.token = null
      this.nombre = null
    },

    restoreToken() {
      const tokenCookie = useCookie('token')
      if (tokenCookie.value && !this.token) {
        this.token = tokenCookie.value
        const payload = jwtDecode<TokenPayload>(tokenCookie.value)
        this.nombre = payload.nombre
      }
    }
  }
})
