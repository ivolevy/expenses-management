# Expense Manager

Aplicación para gestionar y compartir gastos entre usuarios.

## Configuración

Para que la aplicación funcione correctamente, asegúrate de configurar las siguientes variables de entorno en Vercel:

### Variables de entorno necesarias

```
# Supabase - Variables para el servidor
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# Supabase - Variables públicas para el cliente
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

Además, asegúrate de crear un bucket llamado "expenses" en Supabase Storage con permisos públicos de lectura y escritura autenticada.

## Desarrollo local

1. Clona este repositorio
2. Instala dependencias con `npm install` o `pnpm install`
3. Copia el archivo `.env.example` a `.env.local` y configura tus variables
4. Ejecuta el servidor de desarrollo con `npm run dev` o `pnpm dev`
5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador