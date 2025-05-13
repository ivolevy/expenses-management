"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseCard } from "@/components/expense-card"
import { getExpenses } from "@/lib/actions"
import type { Expense } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface ExpenseListProps {
  onEditExpense: (expense: Expense) => void
}

export function ExpenseList({ onEditExpense }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const data = await getExpenses()
      setExpenses(data)
    } catch (error) {
      console.error("Error al cargar los gastos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      loadExpenses()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredExpenses = expenses.filter((expense) => {
    const categoryMatch = expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    const userMatch = `Usuario ${expense.user_id}`.toLowerCase().includes(searchTerm.toLowerCase())
    const amountMatch = expense.amount.toString().includes(searchTerm)

    return categoryMatch || userMatch || amountMatch
  })

  const handleExpenseDeleted = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Todos los Gastos</CardTitle>
            <CardDescription>{expenses.length} gastos registrados</CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar gastos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={() => onEditExpense(expense)}
                onDeleted={handleExpenseDeleted}
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
  )
}
