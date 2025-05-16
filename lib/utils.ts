import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear moneda
export function formatCurrency(amount: number, withSymbol: boolean = true): string {
  return new Intl.NumberFormat("es-ES", {
    style: withSymbol ? "currency" : "decimal",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

// Función para formatear fechas
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

// Función para formatear fechas para exportación
export function formatDateForExport(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}
