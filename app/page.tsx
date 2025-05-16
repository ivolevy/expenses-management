"use client"

import { ExpenseList } from "@/components/expense-list"
import { ExpenseForm } from "@/components/expense-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, LogOut } from "lucide-react"
import { useState, useEffect, useTransition } from "react"
import { ExpenseSummary } from "@/components/expense-summary"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

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

  const handleLogout = async () => {
    setLoading(true)
    
    try {
      // Primero, eliminar la autenticación del localStorage
      // antes de llamar a la API para acelerar la percepción de cierre
      localStorage.removeItem('authenticated')
      
      // Llamada a la API para cierre de sesión en segundo plano
      fetch('/api/logout', {
        method: 'POST',
        cache: 'no-store'
      }).catch(err => {
        console.error('Error al cerrar sesión:', err)
      })
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })
      
      // Usar transition para una navegación más fluida
      startTransition(() => {
        router.push("/login")
        router.refresh()
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-4 max-w-5xl flex-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          {editingExpense && showForm ? "Editar Gasto" : "Gastos Compartidos"}
        </h1>
        <div className="flex flex-wrap w-full sm:w-auto gap-2">
          <Button onClick={handleAddExpense} className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" /> <span className="whitespace-nowrap">Nuevo Gasto</span>
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            disabled={loading || isPending} 
            className="flex-1 sm:flex-none"
          >
            <LogOut className="mr-2 h-4 w-4" /> 
            <span className="whitespace-nowrap">
              {loading || isPending ? "Cerrando..." : "Cerrar Sesión"}
            </span>
          </Button>
        </div>
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
