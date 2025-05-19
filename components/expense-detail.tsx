"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, FileText, Download, ExternalLink, ImageIcon } from "lucide-react"
import type { ExpenseCategory } from "@/lib/data"
import { getUserName, getCategoryIcon } from "@/lib/data"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface ExpenseDetailProps {
  expense: {
    id: string
    amount: number
    category: ExpenseCategory
    user_id: string
    receipt_url?: string | null
    created_at: string
    updated_at: string
  }
  onClose?: () => void
}

export function ExpenseDetail({ expense, onClose }: ExpenseDetailProps) {
  const [isImageOpen, setIsImageOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  // Determinar si el recibo es una imagen basado en la extensión
  const isImageReceipt = expense?.receipt_url && 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(expense.receipt_url) &&
    !imageError
  
  // Resetear el error de imagen si cambia la URL
  useEffect(() => {
    setImageError(false)
  }, [expense.receipt_url])
  
  // Formatear fecha
  const formattedDate = expense.created_at
    ? format(new Date(expense.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
    : "Fecha desconocida"
    
  // Formatear última actualización si existe y es diferente
  const formattedUpdateDate = expense.updated_at && expense.updated_at !== expense.created_at
    ? format(new Date(expense.updated_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
    : null
    
  const CategoryIcon = getCategoryIcon(expense.category)
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle className="text-xl">Detalle del Gasto</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="pt-6 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Categoría</h3>
              <div className="flex items-center mt-1">
                <CategoryIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">{expense.category}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Monto</h3>
              <p className="text-2xl font-bold mt-1">${expense.amount.toFixed(2)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Pagado por</h3>
              <p className="font-medium mt-1">{getUserName(expense.user_id)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fecha de creación</h3>
              <p className="font-medium mt-1 text-primary">{formattedDate}</p>
            </div>
            
            {formattedUpdateDate && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Última actualización</h3>
                <p className="font-medium mt-1 text-muted-foreground">{formattedUpdateDate}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Comprobante</h3>
            {expense.receipt_url ? (
              <div className="border rounded-md overflow-hidden">
                {isImageReceipt ? (
                  <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer relative h-[180px] w-full overflow-hidden bg-muted">
                        <Image
                          src={expense.receipt_url}
                          alt="Comprobante"
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                          <Button variant="secondary" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver imagen completa
                          </Button>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl" hideCloseButton>
                      <span className="sr-only"><DialogTitle>Comprobante</DialogTitle></span>
                      <div className="relative h-[70vh]">
                        <Image
                          src={expense.receipt_url}
                          alt="Comprobante"
                          className="object-contain"
                          fill
                          sizes="100vw"
                          onError={() => setImageError(true)}
                        />
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => setIsImageOpen(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cerrar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => expense.receipt_url && typeof expense.receipt_url === 'string' 
                            ? window.open(expense.receipt_url, "_blank") 
                            : undefined}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center">
                      {imageError ? (
                        <ImageIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                      ) : (
                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                      )}
                      <span>
                        {imageError 
                          ? "Error al cargar la imagen" 
                          : "Documento adjunto"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => expense.receipt_url && typeof expense.receipt_url === 'string'
                        ? window.open(expense.receipt_url, "_blank") 
                        : undefined}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver comprobante
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Sin comprobante</p>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-end gap-2">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 