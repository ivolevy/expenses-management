import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Crear un nombre único para el archivo
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `receipts/${fileName}`

    // Convertir el archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Subir el archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from("expenses")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Error al subir el archivo:", error)
      return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
    }

    // Obtener la URL pública del archivo
    const { data: { publicUrl } } = supabase.storage
      .from("expenses")
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Error en la ruta de carga:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
} 