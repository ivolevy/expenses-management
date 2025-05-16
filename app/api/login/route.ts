import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    // Verificar si las credenciales son admin/admin
    if (username !== "admin" || password !== "admin") {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }
    
    // Crear la respuesta inmediatamente tras validar credenciales
    const response = NextResponse.json({ 
      success: true, 
      message: "Inicio de sesión exitoso" 
    })
    
    // Establecer la cookie de autenticación en la respuesta
    response.cookies.set('authenticated', 'true', { 
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      path: '/' 
    })
    
    // Iniciar la verificación/creación del usuario en Supabase en segundo plano
    // sin esperar para la respuesta
    updateUserInSupabase(username).catch(err => {
      console.error("Error en actualización de usuario (background):", err)
    })
    
    return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}

// Función para actualizar o crear el usuario en Supabase en segundo plano
async function updateUserInSupabase(username: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Buscar o crear el usuario en la base de datos
    const { data: existingUser, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()
      
    if (queryError && queryError.code !== "PGRST116") { // PGRST116 es "no se encontraron resultados"
      throw queryError
    }
    
    if (!existingUser) {
      // Crear el usuario admin si no existe
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          username: "admin",
          is_admin: true,
          created_at: new Date().toISOString()
        })
        
      if (insertError) {
        throw insertError
      }
    }
    
    return true
  } catch (error) {
    console.error("Error en actualización de usuario:", error)
    return false
  }
} 