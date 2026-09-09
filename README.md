# waterdmd — Next.js, PostgreSQL y Vercel

Aplicación de reservas de estancias con identidad visual mexicana. Esta exportación usa **Next.js App Router**, rutas serverless, **PostgreSQL**, y autenticación mediante GitHub OAuth con Auth.js.

## Funciones incluidas

- Catálogo público de propiedades desde PostgreSQL.
- Página de detalle por estancia.
- Favoritos por usuario autenticado.
- Reserva persistente con validación de fechas, capacidad, noches y total calculado del lado del servidor.
- Historial de reservas y cancelación de reservas propias.
- Pruebas unitarias de reglas de reserva.

## Arquitectura

| Capa | Tecnología | Ubicación |
|---|---|---|
| Frontend | Next.js 15 + React 19 | `app/`, `components/` |
| Backend | Route Handlers serverless | `app/api/` |
| Autenticación | Auth.js / GitHub OAuth | `auth.ts` |
| Datos | PostgreSQL (recomendado: Neon) | `lib/db.ts`, `db/schema.sql` |
| Validación de reservas | TypeScript en servidor | `lib/booking.ts` |

## Desarrollo local

1. Instala Node.js 20 o superior y pnpm.
2. Copia las variables de entorno:

   ```bash
   cp .env.example .env.local
   ```

3. Crea una base PostgreSQL y ejecuta el contenido de `db/schema.sql` desde el panel SQL del proveedor.
4. Configura una OAuth App de GitHub con el callback `http://localhost:3000/api/auth/callback/github`.
5. Instala y ejecuta:

   ```bash
   pnpm install
   pnpm dev
   ```

6. Verifica el proyecto:

   ```bash
   pnpm test
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

## Despliegue en Vercel

1. Sube esta carpeta a un repositorio nuevo de GitHub.
2. En Vercel, importa el repositorio. Detectará Next.js automáticamente; no necesitas configurar un directorio de salida.
3. Crea una base PostgreSQL en Neon, copia la cadena de conexión y ejecuta `db/schema.sql` una sola vez.
4. En **Vercel → Settings → Environment Variables**, crea las variables de `.env.example` para Production, Preview y Development.
5. En GitHub, agrega el callback de producción `https://TU-DOMINIO.vercel.app/api/auth/callback/github` a tu OAuth App.
6. Vuelve a desplegar. El comando de build es `pnpm build`.

> Las credenciales no están incluidas en este repositorio. Nunca subas `.env.local` ni una URL de base de datos con contraseña a GitHub.

## Datos iniciales

`db/schema.sql` crea las tablas e inserta el catálogo inicial de estancias. No contiene reseñas ni calificaciones simuladas.
