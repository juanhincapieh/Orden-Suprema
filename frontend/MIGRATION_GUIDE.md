# Guía de Migración: Mock → Backend

## Configuración Rápida

Para cambiar de modo mock a backend real, solo necesitas modificar el archivo `.env`:

```env
# Modo Mock (actual)
VITE_USE_MOCK=true
VITE_API_URL=

# Modo Backend Real
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3001/api/v1
```

## Servicios API Unificados

Se han creado nuevos servicios en `frontend/src/services/api/` que soportan ambos modos:

| Servicio | Archivo | Descripción |
|----------|---------|-------------|
| `missionsApi` | `missionsApi.ts` | Gestión de misiones |
| `notificationsApi` | `notificationsApi.ts` | Notificaciones |
| `usersApi` | `usersApi.ts` | Usuarios y asesinos |
| `coinsApi` | `coinsApi.ts` | Monedas y transacciones |
| `reportsApi` | `reportsApi.ts` | Reportes |

### Uso

```typescript
import { missionsApi, notificationsApi, usersApi, coinsApi, reportsApi } from '../services/api';

// Todos los métodos son async
const missions = await missionsApi.getPublicMissions();
const notifications = await notificationsApi.getAll();
const assassins = await usersApi.getAllAssassins();
```

## Estado Actual

### ✅ Servicios que ya soportan switch automático:

1. **Autenticación** (`jwtAuthService.ts`)
   - `authService.login()`
   - `authService.register()`
   - `authService.logout()`
   - `authService.getCurrentUser()`

### ⚠️ Servicios que usan solo mock (localStorage):

Los siguientes servicios todavía usan localStorage directamente. Para usar el backend real, los hooks deben migrar a los nuevos servicios API:

1. **authService.ts** (el viejo, no jwtAuthService)
   - Funciones de misiones: `getUserMissions()`, `addMission()`, etc.
   - Funciones de reportes: `getReports()`, `addReport()`, etc.
   - Funciones de negociaciones: `getNegotiations()`, etc.

2. **notificationService.ts**
   - Todas las funciones

3. **debtService.ts**
   - Todas las funciones

4. **transactionService.ts**
   - Todas las funciones

5. **assassinProfileService.ts**
   - Todas las funciones

## Migración de Hooks

Para migrar un hook a usar el backend real:

### Antes (Mock):
```typescript
import { authService } from '../../services/authService';

const missions = authService.getUserMissions(email);
```

### Después (API Unificada):
```typescript
import { missionsApi } from '../../services/api';

const missions = await missionsApi.getUserMissions();
```

## Hooks que necesitan migración:

| Hook | Archivo | Servicios usados |
|------|---------|------------------|
| `useAdmin` | `pages/admin/useAdmin.ts` | authService, transactionService, assassinProfileService, notificationService |
| `useContractor` | `pages/contractor/useContractor.ts` | authService, transactionService |
| `useAssassin` | `pages/assasin/useAssassin.ts` | localStorage directo |
| `useMissions` | `pages/Missions/useMissions.ts` | authService |
| `useAssassins` | `pages/Assassins/useAssassins.ts` | authService, transactionService, notificationService |
| `useLogin` | `pages/login/useLogin.ts` | localStorage directo |

## Pasos para Migración Completa

1. **Configurar Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Ejecutar Seed**:
   ```bash
   npm run seed
   ```

3. **Configurar Frontend**:
   ```env
   VITE_USE_MOCK=false
   VITE_API_URL=http://localhost:3001/api/v1
   ```

4. **Limpiar localStorage** (opcional):
   ```javascript
   localStorage.clear()
   ```

5. **Reiniciar Frontend**:
   ```bash
   npm run dev
   ```

## Credenciales de Prueba (Backend)

Las mismas credenciales funcionan en mock y backend:

### Admin
- Email: `admin@hightable.com`
- Password: `admin123`

### Asesinos
- `johnwick@continental.com` / `baba123`
- `caine@continental.com` / `caine123`
- `zero@continental.com` / `zero123`
- `cassian@continental.com` / `cassian123`

### Contratistas
- `winston@continental.com` / `continental123`
- `sofia@casablanca.com` / `casablanca123`
- `bowery@king.com` / `bowery123`
- `adjudicator@hightable.com` / `hightable123`
- `elder@desert.com` / `elder123`

## Notas Importantes

1. **Los servicios API son asíncronos**: Todos los métodos retornan `Promise`, por lo que necesitas usar `async/await`.

2. **El switch es automático**: Si `VITE_USE_MOCK=false` y hay `VITE_API_URL`, los servicios API usan el backend real automáticamente.

3. **Compatibilidad de datos**: Los datos del seed del backend coinciden con los datos mock del frontend.

4. **Token JWT**: El backend usa JWT para autenticación. El token se guarda automáticamente en `localStorage.authToken`.
