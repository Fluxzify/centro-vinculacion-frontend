import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const data = await $fetch<{ token: string }>('/api/auth/login', {
          method: 'POST',
          baseURL: 'https://proyecto-backend-centro-vinculacion-backend-production.up.railway.app',
          body: { email, password },
          credentials: 'include'
        })

        if (!data.token) {
          throw new Error('Credenciales incorrectas')
        }

        this.token = data.token
        localStorage.setItem('token', this.token)
      } catch (error: any) {
        if (error?.data?.message) {
          throw new Error(error.data.message)
        }
        throw new Error('Credenciales incorrectas')
      }
    },

    async register(nombre: string, email: string, password: string) {
      try {
        const data = await $fetch<{ token: string }>('/api/auth/register', {
          method: 'POST',
          baseURL: 'https://proyecto-backend-centro-vinculacion-backend-production.up.railway.app',
          body: { nombre, email, password },
          credentials: 'include'
        })

        if (!data.token) {
          throw new Error('Credenciales incorrectas')
        }

        this.token = data.token
        localStorage.setItem('token', this.token)
      } catch (error: any) {
        if (error?.data?.message) {
          throw new Error(error.data.message)
        }
        throw new Error('Credenciales incorrectas')
      }
    }
  }
})
