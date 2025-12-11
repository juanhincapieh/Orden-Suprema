import { User, Mission, AssassinProfile, Notification } from '../models';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Limpiar datos existentes
    await Notification.destroy({ where: {} });
    await Mission.destroy({ where: {} });
    await AssassinProfile.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Crear usuarios (el password se hashea automáticamente en el hook beforeCreate)
    const users = [
      // Administrador
      {
        id: 'admin-001',
        email: 'admin@hightable.com',
        password: 'admin123',
        name: 'High Table Admin',
        nickname: 'High Table Admin',
        role: 'admin' as const,
        coins: 999999
      },
      // Asesinos
      {
        id: 'assassin-001',
        email: 'johnwick@continental.com',
        password: 'baba123',
        name: 'John Wick',
        nickname: 'John Wick',
        role: 'assassin' as const,
        coins: 250000
      },
      {
        id: 'assassin-002',
        email: 'caine@continental.com',
        password: 'caine123',
        name: 'Caine',
        nickname: 'Caine',
        role: 'assassin' as const,
        coins: 180000
      },
      {
        id: 'assassin-003',
        email: 'zero@continental.com',
        password: 'zero123',
        name: 'Zero',
        nickname: 'Zero',
        role: 'assassin' as const,
        coins: 150000
      },
      {
        id: 'assassin-004',
        email: 'cassian@continental.com',
        password: 'cassian123',
        name: 'Cassian',
        nickname: 'Cassian',
        role: 'assassin' as const,
        coins: 120000
      },
      // Contratistas
      {
        id: 'contractor-001',
        email: 'winston@continental.com',
        password: 'continental123',
        name: 'Winston Scott',
        nickname: 'Winston Scott',
        role: 'contractor' as const,
        coins: 150000
      },
      {
        id: 'contractor-002',
        email: 'sofia@casablanca.com',
        password: 'casablanca123',
        name: 'Sofia Al-Azwar',
        nickname: 'Sofia Al-Azwar',
        role: 'contractor' as const,
        coins: 120000
      },
      {
        id: 'contractor-003',
        email: 'bowery@king.com',
        password: 'bowery123',
        name: 'Bowery King',
        nickname: 'Bowery King',
        role: 'contractor' as const,
        coins: 200000
      },
      {
        id: 'contractor-004',
        email: 'adjudicator@hightable.com',
        password: 'hightable123',
        name: 'The Adjudicator',
        nickname: 'The Adjudicator',
        role: 'contractor' as const,
        coins: 300000
      },
      {
        id: 'contractor-005',
        email: 'elder@desert.com',
        password: 'elder123',
        name: 'The Elder',
        nickname: 'The Elder',
        role: 'contractor' as const,
        coins: 500000
      }
    ];

    // Crear usuarios uno por uno para que el hook de hash funcione
    for (const userData of users) {
      await User.create(userData);
    }
    console.log('✅ Usuarios creados');

    // Crear perfiles de asesinos
    const assassinProfiles = [
      {
        id: 'profile-001',
        userId: 'assassin-001',
        minContractValue: 50000,
        specialties: ['Sigilo', 'Combate cuerpo a cuerpo', 'Armas de fuego'],
        status: 'available' as const,
        locationLat: 4.6097,
        locationLng: -74.0817,
        useAutoLocation: true
      },
      {
        id: 'profile-002',
        userId: 'assassin-002',
        minContractValue: 80000,
        specialties: ['Percepción aumentada', 'Precisión', 'Sigilo'],
        status: 'busy' as const,
        locationLat: 4.6197,
        locationLng: -74.0717,
        useAutoLocation: true
      },
      {
        id: 'profile-003',
        userId: 'assassin-003',
        minContractValue: 70000,
        specialties: ['Armas blancas', 'Sigilo', 'Acrobacia'],
        status: 'available' as const,
        locationLat: 4.5997,
        locationLng: -74.0917,
        useAutoLocation: true
      },
      {
        id: 'profile-004',
        userId: 'assassin-004',
        minContractValue: 65000,
        specialties: ['Rastreo', 'Combate', 'Persistencia'],
        status: 'available' as const,
        locationLat: 4.6297,
        locationLng: -74.0617,
        useAutoLocation: true
      }
    ];

    await AssassinProfile.bulkCreate(assassinProfiles);
    console.log('✅ Perfiles de asesinos creados');


    // Crear misiones públicas (deadline como string)
    const publicMissions = [
      {
        id: 'pub-001',
        title: 'Eliminar a Marcus Valerio',
        description: 'Objetivo de alta prioridad en Nueva York. Ex-miembro de la Alta Mesa que ha violado el código. Requiere discreción absoluta.',
        reward: 75000,
        status: 'open' as const,
        contractorId: 'contractor-001',
        isPrivate: false,
        location: 'Nueva York, USA',
        deadline: '2025-01-15'
      },
      {
        id: 'pub-002',
        title: 'Recuperar artefacto robado',
        description: 'Un medallón de oro antiguo fue robado del Continental de Casablanca. El ladrón se encuentra en Marrakech.',
        reward: 50000,
        status: 'open' as const,
        contractorId: 'contractor-002',
        isPrivate: false,
        location: 'Marrakech, Marruecos',
        deadline: '2025-01-25'
      },
      {
        id: 'pub-003',
        title: 'Eliminar a traidor de la Alta Mesa',
        description: 'Un miembro de la Alta Mesa ha traicionado el código. Objetivo altamente protegido en Berlín. Solo asesinos de élite.',
        reward: 200000,
        status: 'open' as const,
        contractorId: 'contractor-004',
        isPrivate: false,
        location: 'Berlín, Alemania',
        deadline: '2025-02-20'
      },
      {
        id: 'pub-004',
        title: 'Protección de testigo clave',
        description: 'Proteger a un testigo durante 48 horas mientras se traslada de París a Roma. Amenazas confirmadas.',
        reward: 85000,
        status: 'open' as const,
        contractorId: 'contractor-001',
        isPrivate: false,
        location: 'París - Roma',
        deadline: '2025-01-18'
      },
      {
        id: 'pub-005',
        title: 'Infiltración en subasta clandestina',
        description: 'Infiltrarse en subasta de armas en Dubái y eliminar al organizador. Requiere habilidades sociales y combate.',
        reward: 95000,
        status: 'open' as const,
        contractorId: 'contractor-005',
        isPrivate: false,
        location: 'Dubái, EAU',
        deadline: '2025-01-30'
      },
      {
        id: 'pub-006',
        title: 'Eliminar a sicario renegado',
        description: 'Ex-asesino de la organización que ahora trabaja por su cuenta. Conoce nuestros métodos. Extremadamente peligroso.',
        reward: 110000,
        status: 'open' as const,
        contractorId: 'contractor-003',
        isPrivate: false,
        location: 'Tokio, Japón',
        deadline: '2025-02-10'
      },
      {
        id: 'pub-007',
        title: 'Sabotaje de operación rival',
        description: 'Sabotear operación de organización rival sin dejar rastros. Requiere sigilo y precisión quirúrgica.',
        reward: 65000,
        status: 'open' as const,
        contractorId: 'contractor-002',
        isPrivate: false,
        location: 'Londres, UK',
        deadline: '2025-01-28'
      },
      {
        id: 'pub-008',
        title: 'Eliminar a hacker que amenaza la red',
        description: 'Hacker ha penetrado sistemas de la organización. Localizar y eliminar antes de que venda la información.',
        reward: 90000,
        status: 'open' as const,
        contractorId: 'contractor-003',
        isPrivate: false,
        location: 'San Francisco, USA',
        deadline: '2025-01-16'
      }
    ];

    await Mission.bulkCreate(publicMissions);
    console.log('✅ Misiones públicas creadas');


    // Crear misiones privadas asignadas
    const privateMissions = [
      // Misiones de John Wick
      {
        id: 'jw-001',
        title: 'Eliminar a Viktor Tarasov',
        description: 'Objetivo de alta prioridad en Nueva York. Ex-jefe de la mafia rusa que ha violado el código del Continental.',
        reward: 85000,
        status: 'in_progress' as const,
        contractorId: 'contractor-001',
        assassinId: 'assassin-001',
        isPrivate: true,
        location: 'Nueva York, USA',
        deadline: '2025-01-20'
      },
      {
        id: 'jw-002',
        title: 'Recuperar medallón sagrado',
        description: 'Un medallón de oro antiguo fue robado del Continental de Casablanca. Recuperación sin daños al objeto.',
        reward: 60000,
        status: 'in_progress' as const,
        contractorId: 'contractor-002',
        assassinId: 'assassin-001',
        isPrivate: true,
        location: 'Marrakech, Marruecos',
        deadline: '2025-01-18'
      },
      {
        id: 'jw-003',
        title: "Eliminar a Santino D'Antonio",
        description: 'Misión completada exitosamente. Objetivo neutralizado en el Continental de Roma.',
        reward: 120000,
        status: 'completed' as const,
        terminado: true,
        contractorId: 'contractor-001',
        assassinId: 'assassin-001',
        isPrivate: true,
        location: 'Roma, Italia',
        deadline: '2024-10-25'
      },
      {
        id: 'jw-004',
        title: 'Proteger testigo VIP',
        description: 'Misión completada. Testigo trasladado exitosamente de París a Roma sin incidentes.',
        reward: 95000,
        status: 'completed' as const,
        terminado: true,
        contractorId: 'contractor-002',
        assassinId: 'assassin-001',
        isPrivate: true,
        location: 'París - Roma',
        deadline: '2024-10-10'
      },
      {
        id: 'jw-005',
        title: 'Eliminar a Viggo Tarasov',
        description: 'Misión completada. Venganza personal ejecutada.',
        reward: 150000,
        status: 'completed' as const,
        terminado: true,
        contractorId: 'contractor-001',
        assassinId: 'assassin-001',
        isPrivate: true,
        location: 'Nueva York, USA',
        deadline: '2024-09-30'
      },
      // Misiones de Caine
      {
        id: 'ca-001',
        title: 'Eliminar a desertor en Osaka',
        description: 'Ex-miembro del Clan Shimazu que ha traicionado a la organización. Debe ser silenciado.',
        reward: 70000,
        status: 'in_progress' as const,
        contractorId: 'contractor-004',
        assassinId: 'assassin-002',
        isPrivate: true,
        location: 'Osaka, Japón',
        deadline: '2025-01-25'
      },
      {
        id: 'ca-002',
        title: 'Recuperar documentos clasificados',
        description: 'Documentos robados de la Alta Mesa. Recuperar y eliminar al ladrón.',
        reward: 90000,
        status: 'completed' as const,
        terminado: true,
        contractorId: 'contractor-005',
        assassinId: 'assassin-002',
        isPrivate: true,
        location: 'Hong Kong',
        deadline: '2024-11-01'
      },
      // Misiones de Zero
      {
        id: 'ze-001',
        title: 'Infiltrar organización rival',
        description: 'Infiltrarse en los Yakuza de Tokio y obtener información sobre sus operaciones.',
        reward: 100000,
        status: 'in_progress' as const,
        contractorId: 'contractor-003',
        assassinId: 'assassin-003',
        isPrivate: true,
        location: 'Tokio, Japón',
        deadline: '2025-02-01'
      },
      {
        id: 'ze-002',
        title: 'Eliminar a traidor del gremio',
        description: 'Misión completada. Traidor eliminado en combate ceremonial.',
        reward: 80000,
        status: 'completed' as const,
        terminado: true,
        contractorId: 'contractor-004',
        assassinId: 'assassin-003',
        isPrivate: true,
        location: 'Kioto, Japón',
        deadline: '2024-10-20'
      },
      // Misiones de Cassian
      {
        id: 'cs-001',
        title: 'Proteger cargamento valioso',
        description: 'Escoltar cargamento de arte desde Roma hasta Ginebra. Alto valor, múltiples amenazas.',
        reward: 75000,
        status: 'in_progress' as const,
        contractorId: 'contractor-002',
        assassinId: 'assassin-004',
        isPrivate: true,
        location: 'Roma - Ginebra',
        deadline: '2025-01-30'
      }
    ];

    await Mission.bulkCreate(privateMissions);
    console.log('✅ Misiones privadas creadas');

    console.log('🎉 Seed completado exitosamente');
    console.log('');
    console.log('📋 Credenciales de prueba:');
    console.log('   ADMIN: admin@hightable.com / admin123');
    console.log('   ASESINOS:');
    console.log('     - johnwick@continental.com / baba123');
    console.log('     - caine@continental.com / caine123');
    console.log('     - zero@continental.com / zero123');
    console.log('     - cassian@continental.com / cassian123');
    console.log('   CONTRATISTAS:');
    console.log('     - winston@continental.com / continental123');
    console.log('     - sofia@casablanca.com / casablanca123');
    console.log('     - bowery@king.com / bowery123');
    console.log('     - adjudicator@hightable.com / hightable123');
    console.log('     - elder@desert.com / elder123');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
};
