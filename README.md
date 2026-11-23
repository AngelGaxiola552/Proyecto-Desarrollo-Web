# NetScope · Proyecto Final DASW

Herramienta web para escanear puertos con Nmap: el usuario elige un objetivo, configura las
opciones desde un menú (sin escribir comandos) y consulta los resultados después.

ITESO · Desarrollo de Aplicaciones y Servicios Web

**Tecnologías:** React + Vite + Bootstrap (frontend) · Node.js + Express (backend) · Nmap

## Estado actual · Entrega 3

- Frontend con las 11 pantallas conectadas al backend mediante llamadas AJAX (`fetch`).
- Backend Express con autenticación (JWT en cookie), validaciones con zod y rutas para
  usuarios, targets, perfiles de escaneo, escaneos, actividad y estadísticas.
- Los datos se guardan **en memoria** (`server/src/data/store.js`): al reiniciar el servidor
  se borran, excepto los usuarios de prueba. Pendiente: conexión a MongoDB.

## Requisitos

- **Node.js 18 o superior** (`node -v`)
- **Nmap** instalado y disponible en la terminal (`nmap --version`).
  En Windows: instalador de https://nmap.org/download.html (aceptar Npcap).
  Si no lo reconoce, cerrar y volver a abrir VS Code / la terminal.

## Cómo correrlo

Se necesitan **dos terminales**, una para el backend y otra para el frontend.

### 1. Backend (puerto 3001)

```bash
cd server
npm install
copy .env.example .env      # solo la primera vez (en Mac/Linux: cp .env.example .env)
npm run dev
```

Debe aparecer `NetScope API corriendo en http://localhost:3001`.

El archivo `.env` guarda la clave secreta de las sesiones (`JWT_SECRET`) y **no se sube a GitHub**;
cada integrante debe crear el suyo. Sin él, el registro y el login fallan con
`secretOrPrivateKey must have a value`.

### 2. Frontend (puerto 5173)

```bash
cd client
npm install
npm run dev
```

Abrir **http://localhost:5173**. Vite reenvía todas las peticiones `/api/...` al backend
(ver `client/vite.config.js`), así que los dos deben estar corriendo.

### Cuentas de prueba

| Correo | Contraseña | Rol |
|---|---|---|
| angel@netscope.mx | Demo1234 | admin |
| abraham@netscope.mx | Demo1234 | user |

Para escanear se recomienda usar objetivos autorizados: `127.0.0.1` o `scanme.nmap.org`.
Los tipos `-sS`, `-sU` y la opción `-O` requieren ejecutar el servidor como administrador.

## Pantallas

| Pantalla | Ruta | Qué hace |
|---|---|---|
| Landing | `/` | Presentación y aviso de uso ético |
| Login / Registro | `/login`, `/registro` | Iniciar sesión y crear cuenta |
| Dashboard | `/dashboard` | Conteos y últimos escaneos |
| Nuevo escaneo | `/escaneos/nuevo` | Opciones, vista previa del comando, autorización y progreso |
| Historial | `/escaneos` | Búsqueda, filtros, orden, paginado, editar, borrar y cancelar |
| Detalle | `/escaneos/:id` | Puertos encontrados, filtros y exportar JSON |
| Targets | `/targets` | CRUD de objetivos |
| Perfiles | `/perfiles` | CRUD de combinaciones de opciones de Nmap |
| Perfil | `/perfil` | Ver, editar y eliminar la cuenta |
| Actividad | `/actividad` | Bitácora (el admin ve la de todos) |
| Administración | `/admin/usuarios` | CRUD de usuarios (solo admin) |

## Rutas de la API

Todas empiezan con `/api` y, salvo registro y login, requieren sesión.

| Recurso | Rutas |
|---|---|
| Autenticación | `POST /auth/register` · `POST /auth/login` · `POST /auth/logout` |
| Mi cuenta | `GET /users/me` · `PATCH /users/me` · `DELETE /users/me` |
| Usuarios (admin) | `GET /users` · `POST /users` · `PATCH /users/:id` · `DELETE /users/:id` |
| Targets | `GET /targets` · `POST /targets` · `GET /targets/:id` · `PATCH /targets/:id` · `DELETE /targets/:id` |
| Perfiles | `GET /profiles` · `POST /profiles` · `GET /profiles/:id` · `PATCH /profiles/:id` · `DELETE /profiles/:id` |
| Escaneos | `POST /scans/preview` · `POST /scans` · `GET /scans` · `GET /scans/:id` · `PATCH /scans/:id` · `POST /scans/:id/cancel` · `DELETE /scans/:id` |
| Otros | `GET /activity` · `GET /stats` |

Las listas aceptan `?page=` y `?limit=`, además de sus filtros (`q`, `status`, `tag`, `sort`, etc.),
y responden con `{ items, total, page, pages }`.

## Estructura

```
client/                 Frontend (React + Vite)
  src/api.js            Función única para llamar al backend
  src/context/          Sesión (AuthContext) y mensajes de éxito/error (MensajeContext)
  src/components/       Header, Modal, Loader (Lottie), Paginacion, OpcionesNmap
  src/pages/            Una pantalla por archivo
  src/utils/            Formato de fechas/estados y lectura del XML de Nmap
server/                 Backend (Express)
  src/routes/           Definición de rutas
  src/controllers/      Lógica de cada ruta
  src/validators/       Esquemas de validación (zod)
  src/middleware/       Autenticación y rol admin
  src/services/         Armado del comando de Nmap y bitácora
  src/data/store.js     Datos en memoria (se reemplazará por MongoDB)
```

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `secretOrPrivateKey must have a value` | Falta `server/.env`: `copy .env.example .env` y reiniciar el backend |
| "Error al comunicarse con el servidor" | El backend no está corriendo (o se detuvo); revisar su terminal |
| Escaneo "Fallido: Nmap no está instalado" | Instalar Nmap y reabrir la terminal |
| "Too many requests" | Límite de 200 peticiones cada 15 min; esperar o reiniciar el backend |
| Mis datos desaparecieron | Normal por ahora: se guardan en memoria y se borran al reiniciar el servidor |
| Aviso `install-scripts` al hacer `npm install` | Es solo un aviso; si `bcrypt` falla: `npm install-scripts approve bcrypt` y `npm install` |
