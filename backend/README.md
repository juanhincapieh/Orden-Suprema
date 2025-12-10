# Orden Suprema - Backend API

API REST para la aplicación Orden Suprema con SQLite y Sequelize.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
cd backend
npm install
```

## Configuración

Copia `.env.example` a `.env` y ajusta las variables:

```bash
cp .env.example .env
```

## Desarrollo

```bash
npm run dev
```

El servidor correrá en `http://localhost:3001`

## Build

```bash
npm run build
npm start
```

## Base de datos

- SQLite con Sequelize ORM
- La base de datos se crea automáticamente en `data/database.sqlite`
- Los modelos se sincronizan automáticamente al iniciar

## Endpoints

Ver `API_ENDPOINTS.md` en la raíz del proyecto para documentación completa.

## Usuarios de prueba

Se crean automáticamente al iniciar por primera vez:

| Email | Password | Rol |
|-------|----------|-----|
| admin@orden.com | password123 | admin |
| contractor@orden.com | password123 | contractor |
| assassin@orden.com | password123 | assassin |

## Estructura

```
src/
├── config/         # Configuración (DB, env)
├── controllers/    # Lógica de negocio
├── data/           # Seed inicial
├── middleware/     # Auth JWT
├── models/         # Modelos Sequelize
├── routes/         # Definición de rutas
├── types/          # Tipos TypeScript
└── utils/          # Helpers
```

## Modelos

- User - Usuarios del sistema
- Mission - Misiones/contratos
- Negotiation - Negociaciones de recompensa
- Review - Reseñas de misiones
- Report - Reportes de problemas
- Transaction - Historial de transacciones
- Notification - Notificaciones
- Debt - Sistema de favores/deudas
- AssassinProfile - Perfiles de asesinos
- Target - Usuarios marcados como objetivo
