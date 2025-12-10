import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import {
  authService,
  LoginCredentials,
  RegisterData,
  getUserFromToken,
} from '../services/jwtAuthService';

// Tipos del contexto
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  getRedirectPath: () => string;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar usuario desde token al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const localUser = getUserFromToken();
        if (localUser) {
          setUser(localUser);
          // Intentar refrescar datos del usuario desde el backend
          try {
            const freshUser = await authService.getCurrentUser();
            setUser(freshUser);
          } catch {
            // Si falla, mantener usuario local
            console.warn('Could not refresh user data from server');
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(data);
      setUser(response.user);
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Refrescar usuario
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Obtener ruta de redirección según rol
  const getRedirectPath = useCallback((): string => {
    if (!user) return '/login';

    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'contractor':
        return '/contractor';
      case 'assassin':
        return '/assassin';
      default:
        return '/';
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
    getRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC para proteger rutas
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'contractor' | 'assassin')[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate(redirectTo);
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirigir al panel correspondiente si no tiene permiso
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'contractor':
            navigate('/contractor');
            break;
          case 'assassin':
            navigate('/assassin');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'var(--bg-primary)',
        }}
      >
        <div
          style={{
            color: 'var(--primary-gold)',
            fontSize: '1.5rem',
          }}
        >
          Cargando...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

// Hook para redirigir si ya está autenticado
export const useRedirectIfAuthenticated = (redirectTo?: string) => {
  const { isAuthenticated, isLoading, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo || getRedirectPath());
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, getRedirectPath]);
};

export default AuthContext;
