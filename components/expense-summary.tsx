"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getExpenses } from "@/lib/actions"
import { type Expense, getUserColor, getCategoryIcon, getCategoryLabel } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"

export function ExpenseSummary() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  // Actualizar la función para cargar los gastos y refrescar periódicamente
  useEffect(() => {
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

    loadExpenses()

    // Configurar un intervalo para actualizar los datos cada 5 segundos
    const interval = setInterval(() => {
      loadExpenses()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Agrupar gastos por usuario
  const expensesByUser = {
    "1": expenses.filter((e) => e.user_id === "1"),
    "2": expenses.filter((e) => e.user_id === "2"),
    "3": expenses.filter((e) => e.user_id === "3"),
  }

  // Calcular totales por usuario
  const totalByUser = {
    "1": expensesByUser["1"].reduce((sum, e) => sum + Number(e.amount), 0),
    "2": expensesByUser["2"].reduce((sum, e) => sum + Number(e.amount), 0),
    "3": expensesByUser["3"].reduce((sum, e) => sum + Number(e.amount), 0),
  }

  const totalExpenses = totalByUser["1"] + totalByUser["2"] + totalByUser["3"]

  // Agrupar gastos por categoría para cada usuario
  const getExpensesByCategory = (userId: string) => {
    const result: Record<string, number> = {}

    expensesByUser[userId].forEach((expense) => {
      if (!result[expense.category]) {
        result[expense.category] = 0
      }
      result[expense.category] += Number(expense.amount)
    })

    return result
  }

  // Agrupar todos los gastos por categoría
  const getAllExpensesByCategory = () => {
    const result: Record<string, number> = {}

    expenses.forEach((expense) => {
      if (!result[expense.category]) {
        result[expense.category] = 0
      }
      result[expense.category] += Number(expense.amount)
    })

    return result
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Usuario</CardTitle>
        <CardDescription>Resumen de gastos por usuario y categoría</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["1", "2", "3"].map((userId) => {
                const userColor = getUserColor(userId)

                return (
                  <Card key={userId}>
                    <CardHeader className={`${userColor} text-white`}>
                      <div className="flex justify-between items-center">
                        <CardTitle>Usuario {userId}</CardTitle>
                        <div className="text-2xl font-bold">{formatCurrency(totalByUser[userId])}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {expensesByUser[userId].length} gastos registrados
                        </div>

                        {Object.entries(getExpensesByCategory(userId)).length > 0 && (
                          <div className="pt-2 space-y-1">
                            <div className="text-sm font-medium">Por categoría:</div>
                            {Object.entries(getExpensesByCategory(userId)).map(([category, amount]) => {
                              const CategoryIcon = getCategoryIcon(category)
                              return (
                                <div key={category} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-1">
                                    <CategoryIcon className="h-3 w-3 text-muted-foreground" />
                                    <span>{getCategoryLabel(category)}</span>
                                  </div>
                                  <span>{formatCurrency(amount)}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumen General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total de gastos:</span>
                    <span className="font-bold">{formatCurrency(totalExpenses)}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Gastos por categoría:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(getAllExpensesByCategory()).map(([category, amount]) => {
                        const CategoryIcon = getCategoryIcon(category)
                        const percentage = Math.round((amount / totalExpenses) * 100)

                        return (
                          <div key={category} className="flex justify-between items-center p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-full bg-secondary`}>
                                <CategoryIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{getCategoryLabel(category)}</div>
                                <div className="text-xs text-muted-foreground">{percentage}% del total</div>
                              </div>
                            </div>
                            <span className="font-bold">{formatCurrency(amount)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
