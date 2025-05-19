"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Expense, getCategoryIcon, getCategoryLabel, getUserColor, getUserName } from "@/lib/data"
import { Edit, Trash2, FileText, Eye } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { deleteExpense } from "@/lib/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExpenseDetail } from "@/components/expense-detail"

interface ExpenseCardProps {
  expense: Expense
  onEdit: () => void
  onDeleted: (id: string) => void
  onViewDetail?: (expense: Expense) => void
}

export function ExpenseCard({ expense, onEdit, onDeleted, onViewDetail }: ExpenseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const { toast } = useToast()

  const CategoryIcon = getCategoryIcon(expense.category)
  const userColor = getUserColor(expense.user_id)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteExpense(expense.id)
      onDeleted(expense.id)
      toast({
        title: "Gasto eliminado",
        description: "El gasto ha sido eliminado correctamente",
        variant: "default",
      })
    } catch (error) {
      console.error("Error al eliminar el gasto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el gasto",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCardClick = () => {
    if (onViewDetail) {
      onViewDetail(expense);
    } else {
      setIsDetailOpen(true);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent 
          className="p-3 sm:p-4 cursor-pointer"
          onClick={handleCardClick}
        >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${userColor}`}>
              <span className="font-bold text-white">{getUserName(expense.user_id).charAt(0)}</span>
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{getCategoryLabel(expense.category)}</span>
              </div>
              <div className="text-sm text-muted-foreground">{formatDate(new Date(expense.created_at))}</div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end mt-2 sm:mt-0 gap-2">
            <div className="text-right mr-2">
              <div className="font-bold">{formatCurrency(expense.amount)}</div>
              {expense.receipt_url && (
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">Comprobante</span>
                </Badge>
              )}
            </div>

              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
              >
                <Edit className="h-4 w-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente este gasto.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
      
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none" hideCloseButton>
          <span className="sr-only"><DialogTitle>Detalle del gasto</DialogTitle></span>
          <ExpenseDetail 
            expense={expense} 
            onClose={() => setIsDetailOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
