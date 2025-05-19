"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseCard } from "@/components/expense-card"
import { getExpenses } from "@/lib/actions"
import type { Expense } from "@/lib/data"
import { getUserName } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ExportExpenses } from "@/components/export-expenses"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ExpenseDetail } from "@/components/expense-detail"

interface ExpenseListProps {
  onEditExpense: (expense: Expense) => void
}

export function ExpenseList({ onEditExpense }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const loadExpenses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getExpenses()
      
      // Verificar que data sea un array
      if (Array.isArray(data)) {
        setExpenses(data)
      } else {
        console.error("Error: los gastos recibidos no son un array", data)
        setExpenses([])
        setError("Error al cargar los gastos. No se recibió un formato válido.")
      }
    } catch (error) {
      console.error("Error al cargar los gastos:", error)
      setExpenses([])
      setError("Error al cargar los gastos. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  // Efecto para recargar periódicamente, usando un intervalo
  /* Recarga automática desactivada a petición del usuario
  useEffect(() => {
    const interval = setInterval(() => {
      loadExpenses()
    }, 5000)

    return () => clearInterval(interval)
  }, [])
  */

  // Asegurarnos de que expenses sea un array antes de aplicar filter
  const filteredExpenses = Array.isArray(expenses) ? expenses.filter((expense) => {
    if (!expense) return false; // Validación adicional para cada elemento
    
    try {
      const categoryMatch = expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      const userMatch = getUserName(expense.user_id).toLowerCase().includes(searchTerm.toLowerCase())
      const amountMatch = expense.amount.toString().includes(searchTerm)

      return categoryMatch || userMatch || amountMatch
    } catch (e) {
      console.error("Error al filtrar gasto:", e, expense)
      return false;
    }
  }) : [];

  const handleExpenseDeleted = (id: string) => {
    setExpenses(prevExpenses => 
      Array.isArray(prevExpenses) 
        ? prevExpenses.filter((expense) => expense && expense.id !== id)
        : []
    )
  }

  const handleSelectExpense = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const handleCloseDetail = () => {
    setSelectedExpense(null);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Todos los Gastos</CardTitle>
            <CardDescription>
              {Array.isArray(expenses) ? `${expenses.length} gastos registrados` : "Cargando gastos..."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar gastos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ExportExpenses expenses={filteredExpenses} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-destructive">
            {error}
            <button 
              onClick={loadExpenses} 
              className="block mx-auto mt-4 text-primary hover:underline"
            >
              Reintentar
            </button>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={() => onEditExpense(expense)}
                onDeleted={handleExpenseDeleted}
                  onViewDetail={handleSelectExpense}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            {searchTerm ? "No se encontraron gastos que coincidan con la búsqueda" : "No hay gastos registrados"}
          </div>
        )}
      </CardContent>
    </Card>

      <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none" hideCloseButton>
          {selectedExpense && (
            <ExpenseDetail 
              expense={selectedExpense} 
              onClose={handleCloseDetail}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
