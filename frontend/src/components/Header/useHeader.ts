import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';

export const useHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSpanish, toggleLanguage } = useLanguage();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationRef = useRef<string>('');

  const refreshUser = useCallback(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Actualizar el usuario cuando cambie la ruta (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshUser();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, refreshUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Navegación segura con debounce para evitar clicks múltiples
  const safeNavigate = useCallback((path: string) => {
    // Evitar navegación duplicada a la misma ruta
    if (location.pathname === path) {
      return;
    }

    // Evitar navegaciones muy rápidas
    if (lastNavigationRef.current === path) {
      return;
    }

    // Limpiar timeout anterior si existe
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Guardar la última navegación
    lastNavigationRef.current = path;

    // Navegar con un pequeño delay para evitar race conditions
    navigationTimeoutRef.current = setTimeout(() => {
      navigate(path);
      // Resetear después de un tiempo
      setTimeout(() => {
        lastNavigationRef.current = '';
      }, 500);
    }, 50);
  }, [navigate, location.pathname]);

  const handleLogout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    safeNavigate('/');
  }, [safeNavigate]);

  const getPersonalPageRoute = () => {
    if (!currentUser) return '/';
    
    switch (currentUser.role) {
      case 'admin':
        return '/admin';
      case 'contractor':
        return '/contractor';
      case 'assassin':
        return '/assasin';
      default:
        return '/';
    }
  };

  const getPersonalPageLabel = () => {
    if (!currentUser) return '';
    
    if (isSpanish) {
      switch (currentUser.role) {
        case 'admin':
          return 'Panel Admin';
        case 'contractor':
          return 'Panel Contratista';
        case 'assassin':
          return 'Panel Asesino';
        default:
          return 'Mi Panel';
      }
    } else {
      switch (currentUser.role) {
        case 'admin':
          return 'Admin Panel';
        case 'contractor':
          return 'Contractor Panel';
        case 'assassin':
          return 'Assassin Panel';
        default:
          return 'My Panel';
      }
    }
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  return {
    navigate: safeNavigate, // Usar navegación segura
    isSpanish,
    toggleLanguage,
    currentUser,
    showBuyModal,
    setShowBuyModal,
    showProfileMenu,
    setShowProfileMenu,
    profileMenuRef,
    handleLogout,
    getPersonalPageRoute,
    getPersonalPageLabel,
    refreshUser
  };
};
