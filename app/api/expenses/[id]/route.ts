import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { ExpenseCategory } from "@/lib/data"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { amount, category, userId, receiptUrl } = await request.json()
    const { id } = params
    
    if (!amount || !category || !userId || !id) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from("expenses")
      .update({
        amount,
        category,
        user_id: userId,
        receipt_url: receiptUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error al actualizar gasto:", error)
      return NextResponse.json(
        { error: "Error al actualizar gasto" },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error en la ruta PATCH /api/expenses/[id]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 