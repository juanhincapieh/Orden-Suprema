import { useEffect } from 'react';
import './styles/App.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import AppRoutes from './routes';
import { initializeMockData } from './data/mockData';

function App() {
  useEffect(() => {
    // Inicializar datos mock al cargar la aplicación
    // Solo en modo desarrollo o cuando no hay API configurada
    if (!import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK === 'true') {
      initializeMockData();
    }
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <Header />
            <div className="App">
              <AppRoutes />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
