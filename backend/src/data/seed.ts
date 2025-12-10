import { User, AssassinProfile } from '../models';

export const seedDatabase = async () => {
  // Verificar si ya hay usuarios
  const userCount = await User.count();
  if (userCount > 0) {
    console.log('📦 Base de datos ya tiene datos, saltando seed');
    return;
  }

  console.log('🌱 Sembrando datos iniciales...');

  // Crear usuarios de prueba
  const admin = await User.create({
    email: 'admin@orden.com',
    password: 'password123',
    name: 'Administrador',
    nickname: 'Admin',
    role: 'admin',
    coins: 99999,
  });

  const contractor = await User.create({
    email: 'contractor@orden.com',
    password: 'password123',
    name: 'Juan Contratista',
    nickname: 'ElJefe',
    role: 'contractor',
    coins: 5000,
  });

  const assassin = await User.create({
    email: 'assassin@orden.com',
    password: 'password123',
    name: 'Carlos Asesino',
    nickname: 'SombraLetal',
    role: 'assassin',
    coins: 2500,
  });

  // Crear perfil de asesino
  await AssassinProfile.create({
    userId: assassin.id,
    minContractValue: 100,
    specialties: ['sigilo', 'infiltración'],
    status: 'available',
  });

  console.log('✅ Datos iniciales creados:');
  console.log('   - admin@orden.com / password123');
  console.log('   - contractor@orden.com / password123');
  console.log('   - assassin@orden.com / password123');
};
