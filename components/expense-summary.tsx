"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getExpenses } from "@/lib/actions"
import { type Expense, getUserColor, getCategoryIcon, getCategoryLabel, getUserName } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { RefreshCw, Eye } from "lucide-react"
import { ExportExpenses } from "@/components/export-expenses"

type UserID = "1" | "2" | "3"

export function ExpenseSummary() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<UserID | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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

  // Actualizar la función para cargar los gastos
  useEffect(() => {
    loadExpenses()
  }, [])

  // Agrupar gastos por usuario de forma segura
  const expensesByUser: Record<UserID, Expense[]> = {
    "1": Array.isArray(expenses) ? expenses.filter((e) => e && e.user_id === "1") : [],
    "2": Array.isArray(expenses) ? expenses.filter((e) => e && e.user_id === "2") : [],
    "3": Array.isArray(expenses) ? expenses.filter((e) => e && e.user_id === "3") : [],
  }

  // Calcular totales por usuario
  const totalByUser: Record<UserID, number> = {
    "1": expensesByUser["1"].reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    "2": expensesByUser["2"].reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    "3": expensesByUser["3"].reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
  }

  const totalExpenses = totalByUser["1"] + totalByUser["2"] + totalByUser["3"]

  // Agrupar gastos por categoría para cada usuario
  const getExpensesByCategory = (userId: UserID) => {
    const result: Record<string, number> = {}

    if (Array.isArray(expensesByUser[userId])) {
      expensesByUser[userId].forEach((expense: Expense) => {
        if (!expense || !expense.category) return;
        
        if (!result[expense.category]) {
          result[expense.category] = 0
        }
        result[expense.category] += Number(expense.amount) || 0
      })
    }

    return result
  }

  // Agrupar todos los gastos por categoría
  const getAllExpensesByCategory = () => {
    const result: Record<string, number> = {}

    if (Array.isArray(expenses)) {
      expenses.forEach((expense) => {
        if (!expense || !expense.category) return;
        
        if (!result[expense.category]) {
          result[expense.category] = 0
        }
        result[expense.category] += Number(expense.amount) || 0
      })
    }

    return result
  }

  const openUserDetailsModal = (userId: UserID) => {
    setSelectedUserId(userId)
    setModalOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gastos por Usuario</CardTitle>
              <CardDescription>Resumen de gastos por usuario y categoría</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {error && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadExpenses} 
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Reintentar
                </Button>
              )}
              <ExportExpenses expenses={expenses} />
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
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(["1", "2", "3"] as UserID[]).map((userId) => {
                  const userColor = getUserColor(userId)

                  return (
                    <Card key={userId} className="border border-neutral-200 shadow-sm rounded-xl bg-white">
                      <CardHeader className="bg-white text-[#134e4a] p-4 rounded-t-xl">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base sm:text-lg text-[#134e4a]">{getUserName(userId)}</CardTitle>
                          <div className="text-xl sm:text-2xl font-bold text-[#0f172a]">{formatCurrency(totalByUser[userId])}</div>
                        </div>
                      </CardHeader>
                      <CardContent className="bg-gray-50 rounded-b-xl">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {Array.isArray(expensesByUser[userId]) ? `${expensesByUser[userId].length} gastos registrados` : "0 gastos registrados"}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => openUserDetailsModal(userId)}
                          disabled={!Array.isArray(expensesByUser[userId]) || expensesByUser[userId].length === 0}
                        >
                          Ver detalle
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {totalExpenses > 0 && (
                <Card className="border border-neutral-200 shadow-sm rounded-xl bg-white">
                  <CardHeader className="pb-3 rounded-t-xl">
                    <CardTitle className="text-lg sm:text-xl">Resumen General</CardTitle>
                  </CardHeader>
                  <CardContent className="rounded-b-xl">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm sm:text-base">Total de gastos:</span>
                        <span className="font-bold text-base sm:text-lg">{formatCurrency(totalExpenses)}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="font-medium text-sm sm:text-base">Gastos por categoría:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {Object.entries(getAllExpensesByCategory()).map(([category, amount]) => {
                            if (!category) return null;
                            
                            const CategoryIcon = getCategoryIcon(category)
                            const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0

                            return (
                              <div key={category} className="flex justify-between items-center p-2 border rounded-md bg-gray-50">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 sm:p-2 rounded-full bg-secondary`}>
                                    <CategoryIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-xs sm:text-sm">{getCategoryLabel(category)}</div>
                                    <div className="text-2xs sm:text-xs text-muted-foreground">{percentage}% del total</div>
                                  </div>
                                </div>
                                <span className="font-bold text-xs sm:text-sm">{formatCurrency(amount)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${selectedUserId ? getUserColor(selectedUserId) : ''} flex items-center justify-center`}>
                <span className="text-2xs sm:text-xs text-white font-bold">{selectedUserId ? getUserName(selectedUserId).charAt(0) : ''}</span>
              </div>
              Gastos de {selectedUserId ? getUserName(selectedUserId) : ''}
            </DialogTitle>
            <DialogDescription>
              Listado detallado de todos los gastos registrados
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1">
            {selectedUserId && Array.isArray(expensesByUser[selectedUserId]) && expensesByUser[selectedUserId].length > 0 ? (
              <div className="space-y-3">
                {expensesByUser[selectedUserId].map((expense: Expense) => {
                  if (!expense) return null;
                  const CategoryIcon = getCategoryIcon(expense.category)
                  return (
                    <Card key={expense.id}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{getCategoryLabel(expense.category)}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(new Date(expense.created_at))}
                            </div>
                          </div>
                          <div className="font-bold">{formatCurrency(expense.amount)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay gastos registrados para este usuario
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
