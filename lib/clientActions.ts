"use client"

import type { ExpenseCategory } from "./data"

export async function uploadFile(file: File): Promise<string> {
  if (!file) throw new Error("No se proporcionó ningún archivo")

  try {
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
    return url
  } catch (error) {
    console.error("Error al subir el archivo:", error)
    throw error
  }
}

// Función para agregar un nuevo gasto
export async function addExpenseWithFile({
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
    let receiptUrl = null
    
    // Primero cargar el archivo si existe
    if (file) {
      receiptUrl = await uploadFile(file)
    }
    
    // Luego llamar a la acción del servidor para crear el gasto
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        category,
        userId,
        receiptUrl,
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al crear el gasto")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error en addExpenseWithFile:", error)
    throw error
  }
}

// Función para actualizar un gasto existente
export async function updateExpenseWithFile({
  id,
  amount,
  category,
  userId,
  file,
  currentReceiptUrl,
}: {
  id: string
  amount: number
  category: ExpenseCategory
  userId: string
  file: File | null
  currentReceiptUrl: string | null
}) {
  try {
    let receiptUrl = currentReceiptUrl
    
    // Primero cargar el archivo si existe
    if (file) {
      receiptUrl = await uploadFile(file)
    }
    
    // Luego llamar a la acción del servidor para actualizar el gasto
    const response = await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        category,
        userId,
        receiptUrl,
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al actualizar el gasto")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error en updateExpenseWithFile:", error)
    throw error
  }
} 