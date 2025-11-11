import { useEffect } from 'react';
import './styles/App.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import AppRoutes from './routes';
import { initializeMockData } from './data/mockData';

function App() {
  useEffect(() => {
    // Inicializar datos mock al cargar la aplicación
    initializeMockData();
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Header />
        <div className="App">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
