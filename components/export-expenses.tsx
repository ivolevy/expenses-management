"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Download } from "lucide-react"
import { type Expense } from "@/lib/data"
import { getUserName, getCategoryLabel } from "@/lib/data"
import { formatCurrency, formatDateForExport } from "@/lib/utils"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface ExportExpensesProps {
  expenses: Expense[]
}

export function ExportExpenses({ expenses }: ExportExpensesProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Calcular el total de gastos
  const calculateTotal = (): number => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  }

  // Preparar datos para exportación
  const prepareData = () => {
    const data = expenses.map(expense => ({
      Fecha: formatDateForExport(new Date(expense.created_at)),
      Usuario: getUserName(expense.user_id),
      Categoría: getCategoryLabel(expense.category),
      Monto: formatCurrency(expense.amount, false),
    }))

    // Añadir una fila con el total
    const total = calculateTotal()
    data.push({
      Fecha: "",
      Usuario: "",
      Categoría: "TOTAL",
      Monto: formatCurrency(total, false),
    })

    return data
  }

  // Exportar a CSV
  const exportToCSV = () => {
    setIsExporting(true)
    try {
      const data = prepareData()
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos")
      XLSX.writeFile(workbook, "gastos.csv")
    } catch (error) {
      console.error("Error al exportar a CSV:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Exportar a XLSX
  const exportToXLSX = () => {
    setIsExporting(true)
    try {
      const data = prepareData()
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos")
      XLSX.writeFile(workbook, "gastos.xlsx")
    } catch (error) {
      console.error("Error al exportar a XLSX:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Exportar a PDF
  const exportToPDF = () => {
    setIsExporting(true)
    try {
      const data = prepareData().slice(0, -1) // Eliminar la última fila (total) para manejarlo separadamente
      const total = calculateTotal()
      const doc = new jsPDF()
      
      // Título
      doc.setFontSize(18)
      doc.text("Reporte de Gastos", 14, 22)
      doc.setFontSize(11)
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30)
      
      // Tabla
      autoTable(doc, {
        head: [['Fecha', 'Usuario', 'Categoría', 'Monto']],
        body: data.map(item => [
          item.Fecha,
          item.Usuario,
          item.Categoría,
          item.Monto
        ]),
        startY: 35,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      })

      // Añadir el total en una posición calculada después de la tabla
      const finalY = (doc as any).lastAutoTable.finalY || 35;
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${formatCurrency(total)}`, 14, finalY + 10);
      
      doc.save("gastos.pdf")
    } catch (error) {
      console.error("Error al exportar a PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting || expenses.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
          Exportar a CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToXLSX} disabled={isExporting}>
          Exportar a Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
          Exportar a PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 