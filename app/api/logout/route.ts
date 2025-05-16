import { NextResponse } from 'next/server'

// Optimización mediante el uso de Edge Runtime para mejor rendimiento
export const runtime = 'edge'

export async function POST() {
  try {
    // Crear una respuesta
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente"
    }, {
      status: 200,
      // Agregar encabezados de caché para evitar que el navegador almacene en caché esta respuesta
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    // Eliminar la cookie de autenticación
    response.cookies.set('authenticated', '', { 
      expires: new Date(0),
      path: '/',
      // Asegurar que se elimine inmediatamente
      maxAge: 0
    })
    
    return response
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
} 