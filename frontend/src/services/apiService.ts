// Servicio base para comunicación con el backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Tipos para respuestas de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Clase para manejar errores de API
export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Obtener token del localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Guardar token en localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Eliminar token del localStorage
export const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

// Verificar si hay token
export const hasToken = (): boolean => {
  return !!getToken();
};

// Headers por defecto
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Función genérica para hacer peticiones
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...getHeaders(includeAuth),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Intentar parsear la respuesta como JSON
    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch {
      throw new ApiError(
        'Error parsing server response',
        'PARSE_ERROR',
        response.status
      );
    }

    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok || !data.success) {
      throw new ApiError(
        data.error?.message || 'Unknown error',
        data.error?.code || 'UNKNOWN_ERROR',
        response.status,
        data.error?.details
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      // Si es error 401, limpiar token (no redirigir automáticamente para evitar loops)
      if (error.status === 401) {
        removeToken();
        localStorage.removeItem('currentUser');
        // No redirigir automáticamente - dejar que el AuthContext maneje la redirección
      }
      throw error;
    }

    // Error de red u otro error
    throw new ApiError(
      'Network error. Please check your connection.',
      'NETWORK_ERROR',
      0
    );
  }
}

// Métodos HTTP
export const api = {
  get: <T>(endpoint: string, includeAuth: boolean = true): Promise<T> => {
    return request<T>(endpoint, { method: 'GET' }, includeAuth);
  },

  post: <T>(endpoint: string, body?: unknown, includeAuth: boolean = true): Promise<T> => {
    return request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      includeAuth
    );
  },

  put: <T>(endpoint: string, body?: unknown, includeAuth: boolean = true): Promise<T> => {
    return request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      includeAuth
    );
  },

  patch: <T>(endpoint: string, body?: unknown, includeAuth: boolean = true): Promise<T> => {
    return request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      includeAuth
    );
  },

  delete: <T>(endpoint: string, includeAuth: boolean = true): Promise<T> => {
    return request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  },
};

export default api;
