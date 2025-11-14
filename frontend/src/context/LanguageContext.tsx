import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  isSpanish: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar con el idioma del navegador o el guardado en localStorage
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('appLanguage') as Language;
    if (savedLanguage === 'es' || savedLanguage === 'en') {
      return savedLanguage;
    }
    // Detectar idioma del navegador
    return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Guardar el idioma en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'es' ? 'en' : 'es');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const value = {
    language,
    isSpanish: language === 'es',
    toggleLanguage,
    setLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
