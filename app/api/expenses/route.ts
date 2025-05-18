import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { ExpenseCategory } from "@/lib/data"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { amount, category, userId, receiptUrl } = await request.json()
    
    if (!amount || !category || !userId) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        amount,
        category,
        user_id: userId,
        receipt_url: receiptUrl,
      })
      .select()

    if (error) {
      console.error("Error al crear gasto:", error)
      return NextResponse.json(
        { error: "Error al crear gasto" },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error en la ruta POST /api/expenses:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 