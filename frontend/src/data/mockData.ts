import { Contract } from '../types';

// ============================================
// USUARIOS MOCK
// ============================================

// Administrador
export const mockAdmin = {
  email: 'admin@hightable.com',
  password: 'admin123',
  nickname: 'High Table Admin',
  role: 'admin' as const,
  coins: 999999
};

// Asesinos
export const mockAssassins = [
  {
    email: 'johnwick@continental.com',
    password: 'baba123',
    nickname: 'John Wick',
    role: 'assassin' as const,
    coins: 250000
  },
  {
    email: 'caine@continental.com',
    password: 'caine123',
    nickname: 'Caine',
    role: 'assassin' as const,
    coins: 180000
  },
  {
    email: 'zero@continental.com',
    password: 'zero123',
    nickname: 'Zero',
    role: 'assassin' as const,
    coins: 150000
  },
  {
    email: 'cassian@continental.com',
    password: 'cassian123',
    nickname: 'Cassian',
    role: 'assassin' as const,
    coins: 120000
  }
];

// Alias para compatibilidad
export const mockAssassin = mockAssassins[0];

// Contratistas
export const mockContractors = [
  {
    email: 'winston@continental.com',
    password: 'continental123',
    nickname: 'Winston Scott',
    role: 'contractor' as const,
    coins: 150000
  },
  {
    email: 'sofia@casablanca.com',
    password: 'casablanca123',
    nickname: 'Sofia Al-Azwar',
    role: 'contractor' as const,
    coins: 120000
  },
  {
    email: 'bowery@king.com',
    password: 'bowery123',
    nickname: 'Bowery King',
    role: 'contractor' as const,
    coins: 200000
  },
  {
    email: 'adjudicator@hightable.com',
    password: 'hightable123',
    nickname: 'The Adjudicator',
    role: 'contractor' as const,
    coins: 300000
  },
  {
    email: 'elder@desert.com',
    password: 'elder123',
    nickname: 'The Elder',
    role: 'contractor' as const,
    coins: 500000
  }
];

// Alias para compatibilidad
export const mockContractor = mockContractors[0];

// ============================================
// IDs CODIFICADOS (para consistencia)
// ============================================
const IDS = {
  // Asesinos
  johnWick: btoa('johnwick@continental.com'),
  caine: btoa('caine@continental.com'),
  zero: btoa('zero@continental.com'),
  cassian: btoa('cassian@continental.com'),
  // Contratistas
  winston: btoa('winston@continental.com'),
  sofia: btoa('sofia@casablanca.com'),
  bowery: btoa('bowery@king.com'),
  adjudicator: btoa('adjudicator@hightable.com'),
  elder: btoa('elder@desert.com')
};

// ============================================
// MISIONES PÚBLICAS (disponibles para todos)
// ============================================
export const mockPublicMissions: Contract[] = [
  // Misiones abiertas (sin asesino asignado)
  {
    id: 'pub-001',
    title: 'Eliminar a Marcus Valerio',
    description: 'Objetivo de alta prioridad en Nueva York. Ex-miembro de la Alta Mesa que ha violado el código. Requiere discreción absoluta.',
    reward: 75000,
    status: 'open',
    terminado: false,
    contractorId: IDS.winston,
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-11-05'),
    isPrivate: false,
    location: 'Nueva York, USA',
    deadline: '2025-01-15'
  },
  {
    id: 'pub-002',
    title: 'Recuperar artefacto robado',
    description: 'Un medallón de oro antiguo fue robado del Continental de Casablanca. El ladrón se encuentra en Marrakech.',
    reward: 50000,
    status: 'open',
    terminado: false,
    contractorId: IDS.sofia,
    createdAt: new Date('2024-11-06'),
    updatedAt: new Date('2024-11-06'),
    isPrivate: false,
    location: 'Marrakech, Marruecos',
    deadline: '2025-01-25'
  },
  {
    id: 'pub-003',
    title: 'Eliminar a traidor de la Alta Mesa',
    description: 'Un miembro de la Alta Mesa ha traicionado el código. Objetivo altamente protegido en Berlín. Solo asesinos de élite.',
    reward: 200000,
    status: 'open',
    terminado: false,
    contractorId: IDS.adjudicator,
    createdAt: new Date('2024-11-07'),
    updatedAt: new Date('2024-11-07'),
    isPrivate: false,
    location: 'Berlín, Alemania',
    deadline: '2025-02-20'
  },
  {
    id: 'pub-004',
    title: 'Protección de testigo clave',
    description: 'Proteger a un testigo durante 48 horas mientras se traslada de París a Roma. Amenazas confirmadas.',
    reward: 85000,
    status: 'open',
    terminado: false,
    contractorId: IDS.winston,
    createdAt: new Date('2024-11-08'),
    updatedAt: new Date('2024-11-08'),
    isPrivate: false,
    location: 'París - Roma',
    deadline: '2025-01-18'
  },
  {
    id: 'pub-005',
    title: 'Infiltración en subasta clandestina',
    description: 'Infiltrarse en subasta de armas en Dubái y eliminar al organizador. Requiere habilidades sociales y combate.',
    reward: 95000,
    status: 'open',
    terminado: false,
    contractorId: IDS.elder,
    createdAt: new Date('2024-11-03'),
    updatedAt: new Date('2024-11-03'),
    isPrivate: false,
    location: 'Dubái, EAU',
    deadline: '2025-01-30'
  },
  {
    id: 'pub-006',
    title: 'Eliminar a sicario renegado',
    description: 'Ex-asesino de la organización que ahora trabaja por su cuenta. Conoce nuestros métodos. Extremadamente peligroso.',
    reward: 110000,
    status: 'open',
    terminado: false,
    contractorId: IDS.bowery,
    createdAt: new Date('2024-11-02'),
    updatedAt: new Date('2024-11-02'),
    isPrivate: false,
    location: 'Tokio, Japón',
    deadline: '2025-02-10'
  },
  {
    id: 'pub-007',
    title: 'Sabotaje de operación rival',
    description: 'Sabotear operación de organización rival sin dejar rastros. Requiere sigilo y precisión quirúrgica.',
    reward: 65000,
    status: 'open',
    terminado: false,
    contractorId: IDS.sofia,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
    isPrivate: false,
    location: 'Londres, UK',
    deadline: '2025-01-28'
  },
  {
    id: 'pub-008',
    title: 'Eliminar a hacker que amenaza la red',
    description: 'Hacker ha penetrado sistemas de la organización. Localizar y eliminar antes de que venda la información.',
    reward: 90000,
    status: 'open',
    terminado: false,
    contractorId: IDS.bowery,
    createdAt: new Date('2024-11-09'),
    updatedAt: new Date('2024-11-09'),
    isPrivate: false,
    location: 'San Francisco, USA',
    deadline: '2025-01-16'
  },
  // Misiones en negociación (con asesinos reales)
  {
    id: 'pub-009',
    title: 'Neutralizar red de tráfico',
    description: 'Desmantelar operación de tráfico ilegal en los muelles de Nueva York. Múltiples objetivos.',
    reward: 120000,
    status: 'negotiating',
    terminado: false,
    contractorId: IDS.bowery,
    createdAt: new Date('2024-11-04'),
    updatedAt: new Date('2024-11-08'),
    isPrivate: false,
    location: 'Nueva York, USA',
    deadline: '2025-02-01',
    negotiation: {
      id: 'neg-001',
      contractId: 'pub-009',
      proposedBy: 'assassin',
      proposedByEmail: 'caine@continental.com',
      proposedByName: 'Caine',
      proposedReward: 150000,
      message: 'Dada la complejidad de la operación y el número de objetivos, propongo un ajuste en la recompensa.',
      status: 'pending',
      createdAt: new Date('2024-11-08').toISOString()
    }
  },
  {
    id: 'pub-010',
    title: 'Eliminar a líder de cartel',
    description: 'Líder de cartel mexicano con fuerte protección. Operación en territorio hostil.',
    reward: 140000,
    status: 'negotiating',
    terminado: false,
    contractorId: IDS.elder,
    createdAt: new Date('2024-10-30'),
    updatedAt: new Date('2024-11-07'),
    isPrivate: false,
    location: 'Ciudad de México, México',
    deadline: '2025-02-05',
    negotiation: {
      id: 'neg-002',
      contractId: 'pub-010',
      proposedBy: 'assassin',
      proposedByEmail: 'zero@continental.com',
      proposedByName: 'Zero',
      proposedReward: 160000,
      message: 'El nivel de seguridad del objetivo es mayor de lo estimado. Necesito recursos adicionales.',
      status: 'pending',
      createdAt: new Date('2024-11-07').toISOString()
    }
  }
];


// ============================================
// MISIONES PRIVADAS (asignadas a asesinos)
// ============================================

// Misiones de John Wick
const johnWickMissions: Contract[] = [
  {
    id: 'jw-001',
    title: 'Eliminar a Viktor Tarasov',
    description: 'Objetivo de alta prioridad en Nueva York. Ex-jefe de la mafia rusa que ha violado el código del Continental.',
    reward: 85000,
    status: 'in_progress',
    terminado: false,
    contractorId: IDS.winston,
    assassinId: IDS.johnWick,
    assassinName: 'John Wick',
    createdAt: new Date('2024-11-08'),
    updatedAt: new Date('2024-11-09'),
    isPrivate: true,
    location: 'Nueva York, USA',
    deadline: '2025-01-20'
  },
  {
    id: 'jw-002',
    title: 'Recuperar medallón sagrado',
    description: 'Un medallón de oro antiguo fue robado del Continental de Casablanca. Recuperación sin daños al objeto.',
    reward: 60000,
    status: 'in_progress',
    terminado: false,
    contractorId: IDS.sofia,
    assassinId: IDS.johnWick,
    assassinName: 'John Wick',
    createdAt: new Date('2024-11-07'),
    updatedAt: new Date('2024-11-08'),
    isPrivate: true,
    location: 'Marrakech, Marruecos',
    deadline: '2025-01-18'
  },
  {
    id: 'jw-003',
    title: 'Eliminar a Santino D\'Antonio',
    description: 'Misión completada exitosamente. Objetivo neutralizado en el Continental de Roma.',
    reward: 120000,
    status: 'completed',
    terminado: true,
    contractorId: IDS.winston,
    assassinId: IDS.johnWick,
    assassinName: 'John Wick',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-20'),
    isPrivate: true,
    location: 'Roma, Italia',
    deadline: '2024-10-25',
    review: {
      rating: 5,
      comment: 'Trabajo impecable como siempre. El Baba Yaga no decepciona.',
      createdAt: new Date('2024-10-21').toISOString()
    }
  },
  {
    id: 'jw-004',
    title: 'Proteger testigo VIP',
    description: 'Misión completada. Testigo trasladado exitosamente de París a Roma sin incidentes.',
    reward: 95000,
    status: 'completed',
    terminado: true,
    contractorId: IDS.sofia,
    assassinId: IDS.johnWick,
    assassinName: 'John Wick',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-05'),
    isPrivate: true,
    location: 'París - Roma',
    deadline: '2024-10-10',
    review: {
      rating: 5,
      comment: 'Profesional y eficiente. El testigo llegó sin un rasguño.',
      createdAt: new Date('2024-10-06').toISOString()
    }
  },
  {
    id: 'jw-005',
    title: 'Eliminar a Viggo Tarasov',
    description: 'Misión completada. Venganza personal ejecutada.',
    reward: 150000,
    status: 'completed',
    terminado: true,
    contractorId: IDS.winston,
    assassinId: IDS.johnWick,
    assassinName: 'John Wick',
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-09-28'),
    isPrivate: true,
    location: 'Nueva York, USA',
    deadline: '2024-09-30',
    review: {
      rating: 5,
      comment: 'Misión personal completada con determinación absoluta.',
      createdAt: new Date('2024-09-29').toISOString()
    }
  }
];

// Misiones de Caine
const caineMissions: Contract[] = [
  {
    id: 'ca-001',
    title: 'Eliminar a desertor en Osaka',
    description: 'Ex-miembro del Clan Shimazu que ha traicionado a la organización. Debe ser silenciado.',
    reward: 70000,
    status: 'in_progress',
    terminado: false,
    contractorId: IDS.adjudicator,
    assassinId: IDS.caine,
    assassinName: 'Caine',
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-10'),
    isPrivate: true,
    location: 'Osaka, Japón',
    deadline: '2025-01-25'
  },
  {
    id: 'ca-002',
    title: 'Recuperar documentos clasificados',
    description: 'Documentos robados de la Alta Mesa. Recuperar y eliminar al ladrón.',
    reward: 90000,
    status: 'completed',
    terminado: true,
    contractorId: IDS.elder,
    assassinId: IDS.caine,
    assassinName: 'Caine',
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-10-28'),
    isPrivate: true,
    location: 'Hong Kong',
    deadline: '2024-11-01',
    review: {
      rating: 4,
      comment: 'Misión completada eficientemente a pesar de las limitaciones.',
      createdAt: new Date('2024-10-29').toISOString()
    }
  }
];

// Misiones de Zero
const zeroMissions: Contract[] = [
  {
    id: 'ze-001',
    title: 'Infiltrar organización rival',
    description: 'Infiltrarse en los Yakuza de Tokio y obtener información sobre sus operaciones.',
    reward: 100000,
    status: 'in_progress',
    terminado: false,
    contractorId: IDS.bowery,
    assassinId: IDS.zero,
    assassinName: 'Zero',
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-11-06'),
    isPrivate: true,
    location: 'Tokio, Japón',
    deadline: '2025-02-01'
  },
  {
    id: 'ze-002',
    title: 'Eliminar a traidor del gremio',
    description: 'Misión completada. Traidor eliminado en combate ceremonial.',
    reward: 80000,
    status: 'completed',
    terminado: true,
    contractorId: IDS.adjudicator,
    assassinId: IDS.zero,
    assassinName: 'Zero',
    createdAt: new Date('2024-10-10'),
    updatedAt: new Date('2024-10-15'),
    isPrivate: true,
    location: 'Kioto, Japón',
    deadline: '2024-10-20',
    review: {
      rating: 5,
      comment: 'Ejecución perfecta. Honor restaurado.',
      createdAt: new Date('2024-10-16').toISOString()
    }
  }
];

// Misiones de Cassian
const cassianMissions: Contract[] = [
  {
    id: 'cs-001',
    title: 'Proteger cargamento valioso',
    description: 'Escoltar cargamento de arte desde Roma hasta Ginebra. Alto valor, múltiples amenazas.',
    reward: 75000,
    status: 'in_progress',
    terminado: false,
    contractorId: IDS.sofia,
    assassinId: IDS.cassian,
    assassinName: 'Cassian',
    createdAt: new Date('2024-11-12'),
    updatedAt: new Date('2024-11-12'),
    isPrivate: true,
    location: 'Roma - Ginebra',
    deadline: '2025-01-30'
  }
];

// ============================================
// FUNCIÓN DE INICIALIZACIÓN
// ============================================
export const initializeMockData = () => {
  // Verificar si ya hay datos
  const existingPublicMissions = localStorage.getItem('publicMissions');
  
  if (!existingPublicMissions) {
    localStorage.setItem('publicMissions', JSON.stringify(mockPublicMissions));
    console.log('✅ Misiones públicas inicializadas');
  }

  // Registrar usuarios mock
  const users = localStorage.getItem('users');
  const usersDict = users ? JSON.parse(users) : {};
  const roles = localStorage.getItem('roles');
  const rolesDict = roles ? JSON.parse(roles) : {};
  const nicknames = localStorage.getItem('nicknames');
  const nicknamesDict = nicknames ? JSON.parse(nicknames) : {};
  const coins = localStorage.getItem('coins');
  const coinsDict = coins ? JSON.parse(coins) : {};
  
  let newUsersAdded = 0;
  
  // Registrar administrador
  if (!usersDict[mockAdmin.email]) {
    usersDict[mockAdmin.email] = mockAdmin.password;
    rolesDict[mockAdmin.email] = mockAdmin.role;
    nicknamesDict[mockAdmin.email] = mockAdmin.nickname;
    coinsDict[mockAdmin.email] = mockAdmin.coins;
    newUsersAdded++;
  }
  
  // Registrar asesinos
  mockAssassins.forEach(assassin => {
    if (!usersDict[assassin.email]) {
      usersDict[assassin.email] = assassin.password;
      rolesDict[assassin.email] = assassin.role;
      nicknamesDict[assassin.email] = assassin.nickname;
      coinsDict[assassin.email] = assassin.coins;
      newUsersAdded++;
    }
  });
  
  // Registrar contratistas
  mockContractors.forEach(contractor => {
    if (!usersDict[contractor.email]) {
      usersDict[contractor.email] = contractor.password;
      rolesDict[contractor.email] = contractor.role;
      nicknamesDict[contractor.email] = contractor.nickname;
      coinsDict[contractor.email] = contractor.coins;
      newUsersAdded++;
    }
  });
  
  if (newUsersAdded > 0) {
    localStorage.setItem('users', JSON.stringify(usersDict));
    localStorage.setItem('roles', JSON.stringify(rolesDict));
    localStorage.setItem('nicknames', JSON.stringify(nicknamesDict));
    localStorage.setItem('coins', JSON.stringify(coinsDict));
    console.log(`✅ ${newUsersAdded} usuarios mock registrados`);
  }
  
  // Inicializar misiones privadas de asesinos
  const existingUserMissions = localStorage.getItem('userMissions');
  if (!existingUserMissions) {
    const userMissionsDict: Record<string, Contract[]> = {};
    
    // Agrupar misiones por contratista
    const allPrivateMissions = [
      ...johnWickMissions,
      ...caineMissions,
      ...zeroMissions,
      ...cassianMissions
    ];
    
    allPrivateMissions.forEach(mission => {
      const contractorEmail = atob(mission.contractorId);
      if (!userMissionsDict[contractorEmail]) {
        userMissionsDict[contractorEmail] = [];
      }
      userMissionsDict[contractorEmail].push(mission);
    });
    
    localStorage.setItem('userMissions', JSON.stringify(userMissionsDict));
    console.log('✅ Misiones privadas de asesinos inicializadas');
  }
};

// ============================================
// CREDENCIALES DE PRUEBA (para referencia)
// ============================================
/*
ADMINISTRADOR:
  Email: admin@hightable.com
  Password: admin123

ASESINOS:
  Email: johnwick@continental.com | Password: baba123
  Email: caine@continental.com | Password: caine123
  Email: zero@continental.com | Password: zero123
  Email: cassian@continental.com | Password: cassian123

CONTRATISTAS:
  Email: winston@continental.com | Password: continental123
  Email: sofia@casablanca.com | Password: casablanca123
  Email: bowery@king.com | Password: bowery123
  Email: adjudicator@hightable.com | Password: hightable123
  Email: elder@desert.com | Password: elder123
*/
