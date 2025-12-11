# Endpoints del Backend - Orden Suprema

## Base URL
`/api/v1`

---

## Autenticación (`/auth`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/logout` | Cerrar sesión | Sí |
| GET | `/auth/me` | Obtener usuario actual | Sí |

---

## Usuarios (`/users`)
| Método | Endpoint | Descripción | Auth | Admin |
|--------|----------|-------------|------|-------|
| GET | `/users` | Obtener todos los usuarios | Sí | Sí |
| GET | `/users/assassins` | Obtener todos los asesinos | Sí | No |
| GET | `/users/:userId` | Obtener usuario por ID | Sí | No |
| GET | `/users/:userId/status` | Obtener estado de suspensión | Sí | No |
| GET | `/users/:userId/stats` | Obtener estadísticas de asesino | Sí | No |
| PUT | `/users/:userId/role` | Actualizar rol de usuario | Sí | Sí |
| PUT | `/users/:userId/suspend` | Suspender usuario | Sí | Sí |
| PUT | `/users/:userId/unsuspend` | Reactivar usuario | Sí | Sí |
| DELETE | `/users/:userId` | Eliminar usuario | Sí | Sí |

---

## Asesinos (`/assassins` o `/assassin-profiles`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/assassins` | Obtener perfiles de asesinos | Sí |
| GET | `/assassins/location` | Obtener ubicación del asesino actual | Sí |
| PUT | `/assassins/location` | Actualizar ubicación del asesino | Sí |
| GET | `/assassins/:email` | Obtener perfil de asesino por email | Sí |
| PUT | `/assassins/:email` | Actualizar perfil de asesino | Sí |

---

## Misiones (`/missions`)
| Método | Endpoint | Descripción | Auth | Admin |
|--------|----------|-------------|------|-------|
| GET | `/missions` | Obtener misiones públicas | Sí | No |
| GET | `/missions/user` | Obtener misiones del contratista | Sí | No |
| GET | `/missions/assigned` | Obtener misiones asignadas al asesino | Sí | No |
| GET | `/missions/available` | Obtener misiones disponibles | Sí | Sí |
| GET | `/missions/:missionId` | Obtener misión por ID | Sí | No |
| POST | `/missions` | Crear nueva misión | Sí | No |
| PUT | `/missions/:missionId` | Actualizar misión | Sí | No |
| POST | `/missions/:missionId/assign` | Asignar misión a asesino | Sí | No |
| POST | `/missions/:missionId/accept` | Aceptar misión desde notificación | Sí | No |
| POST | `/missions/:missionId/complete` | Completar misión | Sí | No |
| DELETE | `/missions/:missionId` | Eliminar misión | Sí | No |
| POST | `/missions/:missionId/negotiate` | Crear negociación | Sí | No |
| POST | `/missions/:missionId/review` | Crear reseña | Sí | No |

---

## Notificaciones (`/notifications`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Obtener notificaciones del usuario | Sí |
| GET | `/notifications/unread-count` | Obtener cantidad de no leídas | Sí |
| GET | `/notifications/mission-assignments/pending` | Obtener asignaciones pendientes | Sí |
| POST | `/notifications/mission-assignment` | Crear notificación de asignación | Sí |
| PUT | `/notifications/:notificationId/read` | Marcar como leída | Sí |
| PUT | `/notifications/read-all` | Marcar todas como leídas | Sí |
| PUT | `/notifications/mission-assignment/:notificationId/status` | Actualizar estado de asignación | Sí |
| DELETE | `/notifications/:notificationId` | Eliminar notificación | Sí |

---

## Monedas (`/coins`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/coins/balance` | Obtener saldo del usuario | Sí |
| POST | `/coins/purchase` | Comprar monedas | Sí |
| POST | `/coins/transfer` | Transferir monedas | Sí |

---

## Transacciones (`/transactions`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/transactions` | Obtener historial de transacciones | Sí |

---

## Deudas (`/debts`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/debts/favor-request` | Crear solicitud de favor | Sí |
| GET | `/debts` | Obtener deudas del usuario | Sí |
| PUT | `/debts/:debtId/accept` | Aceptar deuda | Sí |
| PUT | `/debts/:debtId/reject` | Rechazar deuda | Sí |
| POST | `/debts/:debtId/request-payment` | Solicitar pago | Sí |
| PUT | `/debts/:debtId/accept-payment` | Aceptar pago | Sí |
| PUT | `/debts/:debtId/reject-payment` | Rechazar pago (marca como objetivo) | Sí |
| POST | `/debts/:debtId/mark-completed` | Marcar como completada | Sí |
| PUT | `/debts/:debtId/confirm-completion` | Confirmar completación | Sí |
| PUT | `/debts/:debtId/reject-completion` | Rechazar completación | Sí |

---

## Negociaciones (`/negotiations`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/negotiations` | Obtener negociaciones | Sí |
| PUT | `/negotiations/:negotiationId` | Actualizar negociación | Sí |
| DELETE | `/negotiations/:negotiationId` | Eliminar negociación | Sí |

---

## Reseñas (`/reviews`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/reviews` | Obtener reseñas | Sí |
| PUT | `/reviews/:reviewId` | Actualizar reseña | Sí |
| DELETE | `/reviews/:reviewId` | Eliminar reseña | Sí |

---

## Reportes (`/reports`)
| Método | Endpoint | Descripción | Auth | Admin |
|--------|----------|-------------|------|-------|
| GET | `/reports` | Obtener reportes | Sí | Sí |
| POST | `/reports` | Crear reporte | Sí | No |
| PUT | `/reports/:reportId` | Actualizar reporte | Sí | Sí |
| DELETE | `/reports/:reportId` | Eliminar reporte | Sí | Sí |

---

## Objetivos (`/targets`)
| Método | Endpoint | Descripción | Auth | Admin |
|--------|----------|-------------|------|-------|
| GET | `/targets` | Obtener estado de objetivo del usuario actual | Sí | No |
| GET | `/targets/all` | Obtener todos los objetivos | Sí | Sí |
| GET | `/targets/:userId` | Verificar si usuario específico es objetivo | Sí | No |

---

## Leaderboard (`/leaderboard`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/leaderboard` | Obtener tabla de posiciones | No |

---

## Credenciales de Prueba

### Administrador
- Email: `admin@hightable.com`
- Password: `admin123`

### Asesinos
| Email | Password | Nickname |
|-------|----------|----------|
| johnwick@continental.com | baba123 | John Wick |
| caine@continental.com | caine123 | Caine |
| zero@continental.com | zero123 | Zero |
| cassian@continental.com | cassian123 | Cassian |

### Contratistas
| Email | Password | Nickname |
|-------|----------|----------|
| winston@continental.com | continental123 | Winston Scott |
| sofia@casablanca.com | casablanca123 | Sofia Al-Azwar |
| bowery@king.com | bowery123 | Bowery King |
| adjudicator@hightable.com | hightable123 | The Adjudicator |
| elder@desert.com | elder123 | The Elder |

---

## Tipos de Notificación
- `transfer` - Transferencia de monedas
- `debt_request` - Solicitud de favor/deuda
- `payment_request` - Solicitud de pago de deuda
- `completion_request` - Solicitud de confirmación de completación
- `mission_assignment` - Asignación de misión
- `negotiation` - Negociación de misión

## Estados de Misión
- `open` - Abierta
- `in_progress` - En progreso
- `completed` - Completada
- `cancelled` - Cancelada
- `negotiating` - En negociación

## Estados de Asesino
- `available` - Disponible
- `busy` - Ocupado
- `inactive` - Inactivo
