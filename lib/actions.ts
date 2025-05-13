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
      // En una aplicación real, aquí subiríamos el archivo a Supabase Storage
      // Por ahora, simulamos una URL
      receiptUrl = `receipt-${Date.now()}-${file.name}`
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
      // En una aplicación real, aquí subiríamos el archivo a Supabase Storage
      // y eliminaríamos el archivo anterior si existe
      receiptUrl = `receipt-${Date.now()}-${file.name}`
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
