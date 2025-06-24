// middleware/auth.global.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  auth.restoreToken()

  const publicPages = ['/login', '/registro', '/forgot-password']

  // Si el usuario está autenticado e intenta acceder a una página pública, lo redirigimos a /calendario-principal
  if (auth.token && publicPages.includes(to.path)) {
    return navigateTo('/calendario-principal')
  }

  // Si el usuario no está autenticado y va a una ruta protegida, lo mandamos a login
  if (!auth.token && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }
})
