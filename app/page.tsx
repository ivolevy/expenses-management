"use client"

import { ExpenseList } from "@/components/expense-list"
import { ExpenseForm } from "@/components/expense-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { ExpenseSummary } from "@/components/expense-summary"

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)

  const handleAddExpense = () => {
    setEditingExpense(null)
    setShowForm(true)
  }

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingExpense(null)
  }

  return (
    <main className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">
          {editingExpense && showForm ? "Editar Gasto" : "Gastos Compartidos"}
        </h1>
        <Button onClick={handleAddExpense} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Gasto
        </Button>
      </div>

      {showForm ? (
        <div className="mb-8 animate-in fade-in duration-300">
          <ExpenseForm expense={editingExpense} onClose={handleCloseForm} />
        </div>
      ) : (
        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="todos">Todos los Gastos</TabsTrigger>
            <TabsTrigger value="por-usuario">Por Usuario</TabsTrigger>
          </TabsList>
          <TabsContent value="todos" className="mt-6">
            <ExpenseList onEditExpense={handleEditExpense} />
          </TabsContent>
          <TabsContent value="por-usuario" className="mt-6">
            <ExpenseSummary />
          </TabsContent>
        </Tabs>
      )}
    </main>
  )
}
