import { ShoppingCart, Car, Film, Zap, Package } from "lucide-react"

export type ExpenseCategory = "COMIDA" | "TRANSPORTE" | "ENTRETENIMIENTO" | "SERVICIOS" | "OTROS"
export type User = "1" | "2" | "3"

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  user_id: string // Cambiado de userId a user_id para coincidir con la base de datos
  receipt_url?: string | null
  created_at: string
  updated_at: string
}

// Función para obtener el ícono de una categoría
export function getCategoryIcon(category: string) {
  switch (category) {
    case "COMIDA":
      return ShoppingCart
    case "TRANSPORTE":
      return Car
    case "ENTRETENIMIENTO":
      return Film
    case "SERVICIOS":
      return Zap
    default:
      return Package
  }
}

// Función para obtener la etiqueta de una categoría
export function getCategoryLabel(category: string): string {
  switch (category) {
    case "COMIDA":
      return "Comida"
    case "TRANSPORTE":
      return "Transporte"
    case "ENTRETENIMIENTO":
      return "Entretenimiento"
    case "SERVICIOS":
      return "Servicios"
    default:
      return "Otros"
  }
}

// Función para obtener el color de un usuario
export function getUserColor(userId: string): string {
  switch (userId) {
    case "1":
      return "bg-emerald-700" // Verde esmeralda más oscuro
    case "2":
      return "bg-amber-700" // Ámbar más oscuro
    case "3":
      return "bg-rose-700" // Rosa más oscuro
    default:
      return "bg-purple-700" // Púrpura más oscuro
  }
}

// Función para obtener el nombre personalizado de un usuario
export function getUserName(userId: string): string {
  switch (userId) {
    case "1":
      return "Juan"
    case "2":
      return "María"
    case "3":
      return "Carlos"
    default:
      return `Usuario ${userId}`
  }
}
