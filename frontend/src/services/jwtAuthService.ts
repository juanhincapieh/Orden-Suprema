// Servicio de autenticación con JWT
import api, { setToken, removeToken, hasToken, ApiError } from './apiService';
import { User } from '../types';

// Tipos para autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nickname: string;
  role: 'admin' | 'contractor' | 'assassin';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: 'admin' | 'contractor' | 'assassin';
  nickname: string;
  iat: number;
  exp: number;
}

// Decodificar JWT sin verificar (la verificación la hace el backend)
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Verificar si el token ha expirado
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload) return true;

  // exp está en segundos, Date.now() en milisegundos
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  // Considerar expirado si faltan menos de 60 segundos
  return currentTime >= expirationTime - 60000;
};

// Obtener usuario del token almacenado
export const getUserFromToken = (): User | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  if (isTokenExpired(token)) {
    removeToken();
    localStorage.removeItem('currentUser');
    return null;
  }

  const payload = decodeToken(token);
  if (!payload) return null;

  // Intentar obtener datos completos del usuario del localStorage
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      // Si falla, construir usuario básico del token
    }
  }

  // Construir usuario básico del token
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.nickname,
    nickname: payload.nickname,
    role: payload.role,
    coins: 0, // Se actualizará al cargar datos del usuario
  };
};

// Servicio de autenticación JWT
export const jwtAuthService = {
  // Registrar nuevo usuario
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data, false);

    // Guardar token y usuario
    setToken(response.token);
    localStorage.setItem('currentUser', JSON.stringify(response.user));

    return response;
  },

  // Iniciar sesión
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials, false);

    // Guardar token y usuario
    setToken(response.token);
    localStorage.setItem('currentUser', JSON.stringify(response.user));

    return response;
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    try {
      // Intentar notificar al backend (opcional)
      if (hasToken()) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignorar errores al cerrar sesión
    } finally {
      // Siempre limpiar datos locales
      removeToken();
      localStorage.removeItem('currentUser');
    }
  },

  // Obtener usuario actual del backend
  getCurrentUser: async (): Promise<User> => {
    const user = await api.get<User>('/auth/me');

    // Actualizar usuario en localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    return user;
  },

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    return !isTokenExpired(token);
  },

  // Obtener rol del usuario actual
  getCurrentRole: (): 'admin' | 'contractor' | 'assassin' | null => {
    const user = getUserFromToken();
    return user?.role || null;
  },

  // Refrescar token (si el backend lo soporta)
  refreshToken: async (): Promise<string | null> => {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh');
      setToken(response.token);
      return response.token;
    } catch {
      return null;
    }
  },

  // Verificar permisos
  hasRole: (requiredRole: 'admin' | 'contractor' | 'assassin'): boolean => {
    const currentRole = jwtAuthService.getCurrentRole();
    if (!currentRole) return false;

    // Admin tiene acceso a todo
    if (currentRole === 'admin') return true;

    return currentRole === requiredRole;
  },

  // Obtener usuario local (sin llamar al backend)
  getLocalUser: (): User | null => {
    return getUserFromToken();
  },

  // Actualizar usuario local
  updateLocalUser: (updates: Partial<User>): void => {
    const currentUser = getUserFromToken();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  },
};

// ============================================
// MODO MOCK - Para desarrollo sin backend
// ============================================

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;

// Generar token JWT mock
const generateMockToken = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      nickname: user.nickname,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 horas
    })
  );
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

// Servicio mock que usa localStorage (comportamiento actual)
export const mockAuthService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[data.email]) {
      throw new ApiError('Email already exists', 'EMAIL_EXISTS', 409);
    }

    // Guardar usuario
    users[data.email] = data.password;
    localStorage.setItem('users', JSON.stringify(users));

    const roles = JSON.parse(localStorage.getItem('roles') || '{}');
    roles[data.email] = data.role;
    localStorage.setItem('roles', JSON.stringify(roles));

    const nicknames = JSON.parse(localStorage.getItem('nicknames') || '{}');
    nicknames[data.email] = data.nickname;
    localStorage.setItem('nicknames', JSON.stringify(nicknames));

    const coins = JSON.parse(localStorage.getItem('coins') || '{}');
    coins[data.email] = 1000;
    localStorage.setItem('coins', JSON.stringify(coins));

    const user: User = {
      id: btoa(data.email),
      email: data.email,
      name: data.nickname,
      nickname: data.nickname,
      role: data.role,
      coins: 1000,
    };

    const token = generateMockToken(user);
    setToken(token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { user, token };
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const roles = JSON.parse(localStorage.getItem('roles') || '{}');
    const nicknames = JSON.parse(localStorage.getItem('nicknames') || '{}');
    const coins = JSON.parse(localStorage.getItem('coins') || '{}');

    if (users[credentials.email] !== credentials.password) {
      throw new ApiError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    const user: User = {
      id: btoa(credentials.email),
      email: credentials.email,
      name: nicknames[credentials.email] || credentials.email,
      nickname: nicknames[credentials.email] || credentials.email,
      role: roles[credentials.email] || 'contractor',
      coins: coins[credentials.email] || 0,
    };

    const token = generateMockToken(user);
    setToken(token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { user, token };
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    removeToken();
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: async (): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const user = getUserFromToken();
    if (!user) {
      throw new ApiError('Not authenticated', 'NOT_AUTHENTICATED', 401);
    }

    // Actualizar coins desde localStorage
    const coins = JSON.parse(localStorage.getItem('coins') || '{}');
    user.coins = coins[user.email] || 0;

    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },

  isAuthenticated: jwtAuthService.isAuthenticated,
  getCurrentRole: jwtAuthService.getCurrentRole,
  hasRole: jwtAuthService.hasRole,
  getLocalUser: jwtAuthService.getLocalUser,
  updateLocalUser: jwtAuthService.updateLocalUser,
  refreshToken: async () => null,
};

// Exportar el servicio apropiado según el modo
export const authService = USE_MOCK ? mockAuthService : jwtAuthService;

export default authService;
