import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  auth.restoreToken()

  const publicPages = ['/login', '/registro', '/forgot-password']

  // Si el token existe pero está expirado, logout y redirigir a login
  if (auth.token && auth.isTokenExpired()) {
    auth.logout()
    return navigateTo('/login')
  }

  // Si está autenticado e intenta acceder a página pública (login, registro, forgot-password)
  if (auth.token && publicPages.includes(to.path)) {
    return navigateTo('/calendario-principal')
  }

  // Si no está autenticado y quiere ir a una página protegida
  if (!auth.token && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }
})
