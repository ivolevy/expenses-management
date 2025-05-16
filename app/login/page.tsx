"use client"

import { LoginForm } from "@/components/login-form"
import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"

// Componente de carga optimizado para mostrar inmediatamente
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default function LoginPage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar de forma rápida si hay autenticación en localStorage
    const isAuthenticated = localStorage.getItem("authenticated") === "true"
    
    if (isAuthenticated) {
      // Redirigir inmediatamente, sin esperar verificaciones adicionales
      router.replace("/")
    } else {
      // Si no hay autenticación, mostrar el formulario rápidamente
      setCheckingAuth(false)
    }
    
    // Este useEffect solo se ejecuta una vez al cargar
  }, [router])

  if (checkingAuth) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-primary mb-6 hidden sm:block">Control de Gastos</h1>
        <Suspense fallback={<LoadingSpinner />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
} 