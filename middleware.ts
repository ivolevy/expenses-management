import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Este middleware se ejecuta antes de que se cargue la página
export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Verificar si es una ruta pública
    if (isPublicRoute(pathname)) {
      return NextResponse.next()
    }

    // Verificar autenticación
    const isAuthenticated = request.cookies.has('authenticated')

    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      const url = new URL('/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }

    // Continuar con la solicitud si está autenticado
    return NextResponse.next()
  } catch (error) {
    console.error('Error en middleware:', error)
    // En caso de error, redirigir a login
    return NextResponse.redirect(new URL('/login', request.url))
  }
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

// Configurar las rutas que deben pasar por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 