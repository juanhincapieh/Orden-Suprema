import express from 'express';
import cors from 'cors';
import { config } from './config';
import { initDatabase } from './config/database';
import { seedDatabase } from './data/seed';
import routes from './routes';

// Importar modelos para registrar asociaciones
import './models';

const app = express();

// Middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint no encontrado' },
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Inicializar base de datos
    await initDatabase();

    // Sembrar datos iniciales
    await seedDatabase();

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${config.port}`);
      console.log(`📝 Ambiente: ${config.nodeEnv}`);
      console.log(`🔗 CORS habilitado para: ${config.cors.origin}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
