"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        cache: 'no-store'
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Error al iniciar sesión",
          variant: "destructive",
        })
        return
      }
      
      // Guardar en localStorage para evitar verificaciones adicionales
      localStorage.setItem('authenticated', 'true')
      
      toast({
        title: "¡Bienvenido!",
        description: "Sesión iniciada correctamente",
      })

      // Usar React Transitions para una navegación más fluida
      startTransition(() => {
        router.push("/")
        router.refresh()
      })
    } catch (error) {
      console.error("Error en inicio de sesión:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg border-opacity-80">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl sm:text-2xl text-center sm:block block">Control de Gastos</CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">
          Ingresa tus credenciales para acceder al sistema
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Usuario
            </label>
            <Input
              id="username"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-10 sm:h-11"
              disabled={loading || isPending}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 sm:h-11"
              disabled={loading || isPending}
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            className="w-full h-10 sm:h-11 text-base" 
            disabled={loading || isPending}
            type="submit"
          >
            {loading || isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 