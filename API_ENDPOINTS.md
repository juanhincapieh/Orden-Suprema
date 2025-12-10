# API Endpoints - Orden Suprema

Este documento describe todos los endpoints necesarios para conectar el frontend con un backend.

## Base URL
```
https://api.ordensupema.com/v1
```

---

## 🔐 Autenticación

### POST `/auth/register`
Registrar un nuevo usuario.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "nickname": "string",
  "role": "admin" | "contractor" | "assassin"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "nickname": "string",
    "role": "admin" | "contractor" | "assassin",
    "coins": 1000,
    "createdAt": "ISO date"
  },
  "token": "JWT token"
}
```

---

### POST `/auth/login`
Iniciar sesión.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "nickname": "string",
    "role": "admin" | "contractor" | "assassin",
    "coins": "number",
    "avatar": "string | null"
  },
  "token": "JWT token"
}
```

---

### POST `/auth/logout`
Cerrar sesión.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

### GET `/auth/me`
Obtener usuario actual.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "string",
  "email": "string",
  "nickname": "string",
  "role": "admin" | "contractor" | "assassin",
  "coins": "number",
  "avatar": "string | null"
}
```

---

## 👥 Usuarios

### GET `/users`
Obtener todos los usuarios (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "users": [
    {
      "id": "string",
      "email": "string",
      "nickname": "string",
      "role": "admin" | "contractor" | "assassin",
      "coins": "number",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### GET `/users/assassins`
Obtener todos los asesinos.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "assassins": [
    {
      "id": "string",
      "email": "string",
      "nickname": "string",
      "rating": "number (0-5)",
      "completedContracts": "number",
      "status": "available" | "busy" | "inactive",
      "location": {
        "lat": "number",
        "lng": "number"
      }
    }
  ]
}
```

---

### PUT `/users/:userId/role`
Actualizar rol de usuario (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "role": "admin" | "contractor" | "assassin"
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

### PUT `/users/:userId/suspend`
Suspender usuario (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

### DELETE `/users/:userId`
Eliminar usuario (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

## 💰 Monedas

### GET `/coins/balance`
Obtener balance de monedas del usuario actual.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "balance": "number"
}
```

---

### POST `/coins/purchase`
Comprar monedas.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "packageId": "string",
  "amount": "number",
  "price": "number"
}
```

**Response (200):**
```json
{
  "success": true,
  "newBalance": "number",
  "transaction": {
    "id": "string",
    "type": "purchase",
    "amount": "number",
    "description": "string",
    "date": "ISO date"
  }
}
```

---

### POST `/coins/transfer`
Transferir monedas a otro usuario.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "recipientEmail": "string",
  "amount": "number",
  "message": "string | null"
}
```

**Response (200):**
```json
{
  "success": true,
  "newBalance": "number",
  "transaction": {
    "id": "string",
    "type": "payment",
    "amount": "number",
    "description": "string",
    "date": "ISO date"
  }
}
```

---

## 📋 Misiones

### GET `/missions`
Obtener misiones públicas disponibles.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `status`: `open` | `negotiating` | `in_progress` | `completed` | `cancelled`
- `search`: string
- `sortBy`: `date` | `reward` | `deadline`
- `sortOrder`: `asc` | `desc`

**Response (200):**
```json
{
  "missions": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "reward": "number",
      "status": "open" | "in_progress" | "completed" | "cancelled" | "negotiating",
      "terminado": "boolean",
      "contractorId": "string",
      "contractorName": "string",
      "assassinId": "string | null",
      "assassinName": "string | null",
      "location": "string | null",
      "deadline": "ISO date | null",
      "isPrivate": "boolean",
      "createdAt": "ISO date",
      "updatedAt": "ISO date",
      "negotiation": {
        "id": "string",
        "proposedBy": "contractor" | "assassin",
        "proposedByEmail": "string",
        "proposedByName": "string",
        "proposedReward": "number",
        "message": "string",
        "status": "pending" | "accepted" | "rejected",
        "createdAt": "ISO date"
      } | null,
      "review": {
        "id": "string",
        "rating": "number (1-5)",
        "comment": "string",
        "createdAt": "ISO date"
      } | null
    }
  ]
}
```

---

### GET `/missions/user`
Obtener misiones del usuario actual (contratista).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "missions": [/* mismo formato que GET /missions */]
}
```

---

### GET `/missions/assigned`
Obtener misiones asignadas al asesino actual.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `status`: `active` | `completed`

**Response (200):**
```json
{
  "missions": [/* mismo formato que GET /missions */]
}
```

---

### GET `/missions/available`
Obtener misiones disponibles para asignar (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "missions": [/* misiones con status open/negotiating sin assassinId */]
}
```

---

### GET `/missions/:missionId`
Obtener detalle de una misión.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "mission": {/* mismo formato que en lista */}
}
```

---

### POST `/missions`
Crear nueva misión.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "reward": "number",
  "location": "string | null",
  "deadline": "ISO date | null",
  "isPrivate": "boolean",
  "targetAssassinId": "string | null"
}
```

**Response (201):**
```json
{
  "success": true,
  "mission": {/* misión creada */},
  "newBalance": "number"
}
```

---

### PUT `/missions/:missionId`
Actualizar misión.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "reward": "number",
  "status": "string",
  "location": "string",
  "deadline": "ISO date"
}
```

**Response (200):**
```json
{
  "success": true,
  "mission": {/* misión actualizada */}
}
```

---

### POST `/missions/:missionId/assign`
Asignar misión a un asesino (admin o auto-asignación).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "assassinId": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "mission": {/* misión con assassinId y status in_progress */}
}
```

---

### POST `/missions/:missionId/complete`
Marcar misión como completada.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "mission": {/* misión completada */},
  "reward": "number",
  "newBalance": "number"
}
```

---

### DELETE `/missions/:missionId`
Eliminar/cancelar misión.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

## 🤝 Negociaciones

### POST `/missions/:missionId/negotiate`
Proponer negociación de recompensa.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "proposedReward": "number",
  "message": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "negotiation": {
    "id": "string",
    "contractId": "string",
    "proposedBy": "contractor" | "assassin",
    "proposedByEmail": "string",
    "proposedByName": "string",
    "proposedReward": "number",
    "message": "string",
    "status": "pending",
    "createdAt": "ISO date"
  }
}
```

---

### PUT `/negotiations/:negotiationId/accept`
Aceptar negociación.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "mission": {/* misión actualizada con nuevo reward y asignada */}
}
```

---

### PUT `/negotiations/:negotiationId/reject`
Rechazar negociación.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

## ⭐ Reseñas

### POST `/missions/:missionId/review`
Crear/actualizar reseña de misión completada.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": "number (1-5)",
  "comment": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "review": {
    "id": "string",
    "contractId": "string",
    "rating": "number",
    "comment": "string",
    "createdAt": "ISO date"
  }
}
```

---

### GET `/reviews`
Obtener todas las reseñas públicas.

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "string",
      "missionTitle": "string",
      "assassinName": "string",
      "contractorName": "string",
      "rating": "number",
      "comment": "string",
      "createdAt": "ISO date"
    }
  ]
}
```

---

## 🚨 Reportes

### POST `/reports`
Crear reporte de misión.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "contractId": "string",
  "description": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "report": {
    "id": "string",
    "contractId": "string",
    "contractTitle": "string",
    "reporterEmail": "string",
    "reporterName": "string",
    "description": "string",
    "status": "pending",
    "createdAt": "ISO date"
  }
}
```

---

### GET `/reports`
Obtener todos los reportes (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "reports": [
    {
      "id": "string",
      "contractId": "string",
      "contractTitle": "string",
      "reporterEmail": "string",
      "reporterName": "string",
      "description": "string",
      "status": "pending" | "resolved" | "cancelled",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### PUT `/reports/:reportId/resolve`
Resolver reporte (penalizar).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

### PUT `/reports/:reportId/cancel`
Cancelar reporte.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

## 💳 Transacciones

### GET `/transactions`
Obtener historial de transacciones (admin: todas, usuario: propias).

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `userId`: string (solo admin)
- `type`: `purchase` | `payment` | `reward`

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "string",
      "userId": "string",
      "userEmail": "string",
      "userName": "string",
      "type": "purchase" | "payment" | "reward",
      "amount": "number",
      "description": "string",
      "date": "ISO date"
    }
  ]
}
```

---

## 🔔 Notificaciones

### GET `/notifications`
Obtener notificaciones del usuario actual.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "string",
      "type": "transfer" | "debt_request" | "payment_request" | "completion_request" | "mission_assigned" | "negotiation",
      "senderEmail": "string",
      "senderName": "string",
      "amount": "number | null",
      "message": "string | null",
      "debtId": "string | null",
      "missionId": "string | null",
      "read": "boolean",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### PUT `/notifications/:notificationId/read`
Marcar notificación como leída.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

### PUT `/notifications/read-all`
Marcar todas las notificaciones como leídas.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

### DELETE `/notifications/:notificationId`
Eliminar notificación.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

## 🗡️ Perfiles de Asesinos

### GET `/assassin-profiles`
Obtener todos los perfiles de asesinos.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "profiles": [
    {
      "id": "string",
      "email": "string",
      "name": "string",
      "nickname": "string",
      "minContractValue": "number",
      "specialties": ["string"],
      "status": "available" | "busy" | "inactive",
      "location": {
        "lat": "number",
        "lng": "number"
      } | null,
      "stats": {
        "averageRatingAllTime": "number",
        "averageRatingLastMonth": "number",
        "completedContracts": "number",
        "totalEarnings": "number",
        "activeContracts": "number"
      },
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### GET `/assassin-profiles/:email`
Obtener perfil de un asesino específico.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "profile": {/* mismo formato que en lista */}
}
```

---

### PUT `/assassin-profiles/:email`
Actualizar perfil de asesino (admin o propio).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "nickname": "string",
  "minContractValue": "number",
  "specialties": ["string"],
  "status": "available" | "busy" | "inactive"
}
```

**Response (200):**
```json
{
  "success": true,
  "profile": {/* perfil actualizado */}
}
```

---

## 💸 Sistema de Deudas (Favores)

### POST `/debts/favor-request`
Crear solicitud de favor (registrar deuda).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "creditorEmail": "string",
  "description": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "debt": {
    "id": "string",
    "debtorId": "string",
    "creditorId": "string",
    "favorDescription": "string",
    "status": "pending",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

### GET `/debts`
Obtener deudas del usuario actual.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "debtsIOwe": [
    {
      "id": "string",
      "debtorId": "string",
      "creditorId": "string",
      "favorDescription": "string",
      "paymentDescription": "string | null",
      "status": "pending" | "active" | "payment_requested" | "in_progress" | "completed" | "rejected",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "debtsOwedToMe": [/* mismo formato */]
}
```

---

### PUT `/debts/:debtId/accept`
Aceptar solicitud de favor.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "debt": {/* deuda con status active */}
}
```

---

### PUT `/debts/:debtId/reject`
Rechazar solicitud de favor.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

### POST `/debts/:debtId/request-payment`
Solicitar pago de deuda.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "paymentDescription": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "debt": {/* deuda con status payment_requested */}
}
```

---

### PUT `/debts/:debtId/accept-payment`
Aceptar solicitud de pago.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "debt": {/* deuda con status in_progress */}
}
```

---

### PUT `/debts/:debtId/reject-payment`
Rechazar solicitud de pago (marca como objetivo).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "targetStatus": {
    "assassinId": "string",
    "debtId": "string",
    "markedAt": "ISO date",
    "reason": "string"
  }
}
```

---

### POST `/debts/:debtId/mark-completed`
Marcar deuda como completada (solicitar confirmación).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

### PUT `/debts/:debtId/confirm-completion`
Confirmar completación de deuda.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

### PUT `/debts/:debtId/reject-completion`
Rechazar completación de deuda.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

## 🎯 Objetivos (Targets)

### GET `/targets`
Verificar si el usuario actual es objetivo.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "isTarget": "boolean",
  "targetInfo": {
    "assassinId": "string",
    "debtId": "string",
    "markedAt": "ISO date",
    "reason": "string"
  } | null
}
```

---

## 🏆 Leaderboard

### GET `/leaderboard`
Obtener clasificación de asesinos.

**Query Params:**
- `period`: `all_time` | `monthly` | `weekly`
- `limit`: number (default: 10)

**Response (200):**
```json
{
  "leaderboard": [
    {
      "rank": "number",
      "assassinId": "string",
      "nickname": "string",
      "rating": "number",
      "completedMissions": "number",
      "totalEarnings": "number"
    }
  ]
}
```

---

## Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - Sin permisos para esta acción |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Recurso ya existe |
| 422 | Unprocessable Entity - Validación fallida |
| 500 | Internal Server Error |

**Formato de Error:**
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {} | null
  }
}
```
