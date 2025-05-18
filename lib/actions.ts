"use server"

import { revalidatePath } from "next/cache"
import type { ExpenseCategory } from "./data"
import { createServerSupabaseClient } from "./supabase"

// Función para obtener todos los gastos
export async function getExpenses() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("expenses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener gastos:", error)
      throw new Error("Error al obtener gastos")
    }

    return data || []
  } catch (error) {
    console.error("Error en getExpenses:", error)
    return []
  }
}

// Función para agregar un nuevo gasto
export async function addExpense({
  amount,
  category,
  userId,
  file,
}: {
  amount: number
  category: ExpenseCategory
  userId: string
  file: File | null
}) {
  try {
    const supabase = createServerSupabaseClient()

    let receiptUrl = null
    if (file) {
      // Cargar el archivo utilizando la API
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al subir el archivo")
      }
      
      const { url } = await response.json()
      receiptUrl = url
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        amount,
        category,
        user_id: userId, // Asegurarse de que se use user_id
        receipt_url: receiptUrl,
      })
      .select()

    if (error) {
      console.error("Error al agregar gasto:", error)
      throw new Error("Error al agregar gasto")
    }

    revalidatePath("/")
    return data[0]
  } catch (error) {
    console.error("Error en addExpense:", error)
    throw error
  }
}

// Función para actualizar un gasto existente
export async function updateExpense({
  id,
  amount,
  category,
  userId,
  file,
}: {
  id: string
  amount: number
  category: ExpenseCategory
  userId: string
  file: File | null
}) {
  try {
    const supabase = createServerSupabaseClient()

    // Primero obtenemos el gasto actual para verificar si hay cambios en el recibo
    const { data: existingExpense, error: fetchError } = await supabase
      .from("expenses")
      .select("receipt_url")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error al obtener gasto existente:", fetchError)
      throw new Error("Error al obtener gasto existente")
    }

    let receiptUrl = existingExpense?.receipt_url || null
    if (file) {
      // Cargar el archivo utilizando la API
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al subir el archivo")
      }
      
      const { url } = await response.json()
      receiptUrl = url
    }

    const { data, error } = await supabase
      .from("expenses")
      .update({
        amount,
        category,
        user_id: userId, // Asegurarse de que se use user_id
        receipt_url: receiptUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error al actualizar gasto:", error)
      throw new Error("Error al actualizar gasto")
    }

    revalidatePath("/")
    return data[0]
  } catch (error) {
    console.error("Error en updateExpense:", error)
    throw error
  }
}

// Función para eliminar un gasto
export async function deleteExpense(id: string) {
  try {
    const supabase = createServerSupabaseClient()

    // En una aplicación real, aquí también eliminaríamos el archivo de Supabase Storage si existe

    const { error } = await supabase.from("expenses").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar gasto:", error)
      throw new Error("Error al eliminar gasto")
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error en deleteExpense:", error)
    throw error
  }
}

// Función para verificar credenciales y crear una sesión
export async function loginUser(username: string, password: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Verificar si las credenciales son admin/admin
    if (username !== "admin" || password !== "admin") {
      return { error: "Credenciales inválidas" }
    }
    
    // Buscar o crear el usuario en la base de datos
    const { data: existingUser, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()
      
    if (queryError && queryError.code !== "PGRST116") { // PGRST116 es "no se encontraron resultados"
      console.error("Error al buscar usuario:", queryError)
      return { error: "Error al iniciar sesión" }
    }
    
    if (!existingUser) {
      // Crear el usuario admin si no existe
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          username: "admin",
          is_admin: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
        
      if (insertError) {
        console.error("Error al crear usuario:", insertError)
        return { error: "Error al crear usuario" }
      }
    }
    
    // En una implementación real, generaríamos y firmaríamos un token JWT
    // Para esta demo, simplemente devolvemos éxito y la cookie se maneja en el cliente
    return { success: true, message: "Inicio de sesión exitoso" }
  } catch (error) {
    console.error("Error en loginUser:", error)
    return { error: "Error al iniciar sesión" }
  }
}

// Verificar si existe una sesión activa
export async function checkSession() {
  try {
    const supabase = createServerSupabaseClient()
    
    // En una implementación real, aquí verificaríamos si el token JWT es válido
    // Para esta demo, simplemente verificamos si el usuario admin existe
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", "admin")
      .single()
      
    if (error) {
      return { authenticated: false }
    }
    
    return { authenticated: true, user: data }
  } catch (error) {
    console.error("Error en checkSession:", error)
    return { authenticated: false }
  }
}
