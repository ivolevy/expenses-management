"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, AlertCircle, InfoIcon } from "lucide-react"
import { addExpenseWithFile, updateExpenseWithFile } from "@/lib/clientActions"
import type { ExpenseCategory } from "@/lib/data"
import { getUserName } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ExpenseFormProps {
  expense?: {
    id: string
    amount: number
    category: ExpenseCategory
    user_id: string
    receipt_url?: string | null
    created_at: string
    updated_at: string
  } | null
  onClose: () => void
}

export function ExpenseForm({ expense, onClose }: ExpenseFormProps) {
  const [amount, setAmount] = useState(expense?.amount.toString() || "")
  const [category, setCategory] = useState<ExpenseCategory | "">(expense?.category || "")
  const [userId, setUserId] = useState(expense?.user_id || "")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(expense?.receipt_url || null)
  const [errors, setErrors] = useState<{
    amount?: string
    category?: string
    userId?: string
    file?: string
    general?: string
  }>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const { toast } = useToast()

  // Validar el formulario cuando cambian los valores, pero solo si ya se intentó enviar
  useEffect(() => {
    if (formSubmitted) {
      validateForm()
    }
  }, [amount, category, userId, file, preview, formSubmitted])

  const validateForm = () => {
    const newErrors: {
      amount?: string
      category?: string
      userId?: string
      file?: string
    } = {}

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = "El precio es obligatorio y debe ser mayor que 0"
    }

    if (!category) {
      newErrors.category = "La categoría es obligatoria"
    }

    if (!userId) {
      newErrors.userId = "El usuario es obligatorio"
    }

    // Si es un nuevo gasto o si se está editando y no hay comprobante previo ni nuevo archivo
    if (!expense && !file) {
      newErrors.file = "El comprobante es obligatorio"
    } else if (expense && !expense.receipt_url && !file) {
      newErrors.file = "El comprobante es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)

      // Create preview for image files
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        // For non-image files, just show the file name
        setPreview(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)

    if (!validateForm()) {
      setShowErrors(true)
      // Desaparecer el mensaje de error después de 5 segundos
      setTimeout(() => setShowErrors(false), 5000)
      return
    }

    setIsSubmitting(true)

    try {
      if (expense) {
        await updateExpenseWithFile({
          id: expense.id,
          amount: Number.parseFloat(amount),
          category: category as ExpenseCategory,
          userId,
          file,
          currentReceiptUrl: expense.receipt_url || null,
        })
      } else {
        await addExpenseWithFile({
          amount: Number.parseFloat(amount),
          category: category as ExpenseCategory,
          userId,
          file,
        })
      }

      toast({
        title: expense ? "Gasto actualizado" : "Gasto añadido",
        description: expense ? "El gasto se ha actualizado correctamente" : "El gasto se ha añadido correctamente",
        variant: "success",
      })

      onClose()
    } catch (error) {
      console.error("Error al guardar el gasto:", error)
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error al guardar el gasto"
      setErrors({
        ...errors,
        general: errorMessage
      })
      setShowErrors(true)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      setTimeout(() => setShowErrors(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = amount && category && userId && (file || (expense && expense.receipt_url))

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{expense ? "Editar Gasto" : "Nuevo Gasto"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div 
            className={`transition-all duration-300 ease-in-out transform origin-top ${formSubmitted && showErrors && Object.keys(errors).length > 0 
              ? 'opacity-100 max-h-48 scale-y-100 mb-4' 
              : 'opacity-0 max-h-0 scale-y-95 overflow-hidden'}`}
          >
            <Alert variant="info" className="shadow-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Por favor, revisa el formulario</AlertTitle>
              <AlertDescription className="mt-2">
                {errors.general || "Completa todos los campos obligatorios para continuar."}
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center">
              Precio del gasto <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`pl-8 transition-colors duration-200 ${formSubmitted && errors.amount ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" : ""}`}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                }}
                required
              />
            </div>
            <div 
              className={`transition-all duration-200 ease-in-out ${
                formSubmitted && errors.amount 
                  ? 'opacity-100 max-h-10' 
                  : 'opacity-0 max-h-0 overflow-hidden'
              }`}
            >
              <p className="text-xs text-red-500 mt-1 flex items-center">
                <InfoIcon className="h-3 w-3 mr-1" /> {errors.amount}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center">
              Motivo del gasto <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(value: ExpenseCategory) => {
                setCategory(value)
              }}
            >
              <SelectTrigger 
                id="category" 
                className={`transition-colors duration-200 ${formSubmitted && errors.category ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" : ""}`}
              >
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMIDA">Comida</SelectItem>
                <SelectItem value="TRANSPORTE">Transporte</SelectItem>
                <SelectItem value="ENTRETENIMIENTO">Entretenimiento</SelectItem>
                <SelectItem value="SERVICIOS">Servicios</SelectItem>
                <SelectItem value="OTROS">Otros</SelectItem>
              </SelectContent>
            </Select>
            <div 
              className={`transition-all duration-200 ease-in-out ${
                formSubmitted && errors.category 
                  ? 'opacity-100 max-h-10' 
                  : 'opacity-0 max-h-0 overflow-hidden'
              }`}
            >
              <p className="text-xs text-red-500 mt-1 flex items-center">
                <InfoIcon className="h-3 w-3 mr-1" /> {errors.category}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user" className="flex items-center">
              ¿Quién pagó? <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={userId}
              onValueChange={(value) => {
                setUserId(value)
              }}
            >
              <SelectTrigger 
                id="user" 
                className={`transition-colors duration-200 ${formSubmitted && errors.userId ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" : ""}`}
              >
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{getUserName("1")}</SelectItem>
                <SelectItem value="2">{getUserName("2")}</SelectItem>
                <SelectItem value="3">{getUserName("3")}</SelectItem>
              </SelectContent>
            </Select>
            <div 
              className={`transition-all duration-200 ease-in-out ${
                formSubmitted && errors.userId 
                  ? 'opacity-100 max-h-10' 
                  : 'opacity-0 max-h-0 overflow-hidden'
              }`}
            >
              <p className="text-xs text-red-500 mt-1 flex items-center">
                <InfoIcon className="h-3 w-3 mr-1" /> {errors.userId}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt" className="flex items-center">
              Comprobante <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("receipt")?.click()}
                  className={`w-full transition-colors duration-200 ${formSubmitted && errors.file ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" : ""}`}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Subir comprobante
                </Button>
                <Input
                  id="receipt"
                  type="file"
                  className="hidden"
                  accept=".pdf,.csv,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
              <div 
                className={`transition-all duration-200 ease-in-out ${
                  formSubmitted && errors.file 
                    ? 'opacity-100 max-h-10' 
                    : 'opacity-0 max-h-0 overflow-hidden'
                }`}
              >
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <InfoIcon className="h-3 w-3 mr-1" /> {errors.file}
                </p>
              </div>

              {preview && preview.startsWith("data:image") && (
                <div className="relative mt-2 rounded-md overflow-hidden border">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Vista previa"
                    className="max-h-40 w-full object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {file && !preview && (
                <div className="flex items-center justify-between p-2 mt-2 border rounded-md">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setFile(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {expense?.receipt_url && !file && !preview && (
                <div className="flex items-center justify-between p-2 mt-2 border rounded-md">
                  <span className="text-sm truncate">Comprobante actual</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setPreview(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : expense ? "Actualizar" : "Guardar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
