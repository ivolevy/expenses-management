import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Este middleware se ejecuta antes de que se cargue la página
export function middleware(request: NextRequest) {
  // Verificar si es una ruta pública (no requiere autenticación)
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next()
  }
  
  // En una aplicación real, aquí verificaríamos el token JWT
  // Para esta demo, solo verificamos que exista la cookie de autenticación
  const authCookie = request.cookies.get('authenticated')
  const isAuthenticated = authCookie?.value === 'true'

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    // Usar 307 (Temporary Redirect) en lugar del 302 por defecto para mejor rendimiento
    return NextResponse.redirect(loginUrl, { status: 307 })
  }

  return NextResponse.next()
}

// Función auxiliar para verificar rutas públicas (para mejorar rendimiento)
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/login',
    '/api/login',
    '/api/logout'
  ]
  
  // Verificar rutas estáticas y recursos
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.includes('.') // Archivos con extensión (imágenes, js, css, etc.)
  ) {
    return true
  }
  
  return publicRoutes.includes(pathname)
}

// Configurar las rutas donde se debe ejecutar el middleware (todas excepto api)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 