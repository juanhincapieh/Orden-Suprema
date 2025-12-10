import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'database.sqlite');

// Crear directorio data si no existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('📦 Conexión a SQLite establecida');
    
    // Sincronizar modelos
    await sequelize.sync({ alter: true });
    console.log('📦 Modelos sincronizados');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
};
