import { Contract } from '../types';

// Usuario administrador mock
export const mockAdmin = {
  email: 'admin@hightable.com',
  password: 'admin123',
  nickname: 'High Table Admin',
  role: 'admin' as const,
  coins: 999999
};

// Usuario asesino mock
export const mockAssassin = {
  email: 'johnwick@continental.com',
  password: 'baba123',
  nickname: 'John Wick',
  role: 'assassin' as const,
  coins: 250000
};

// Usuario contratista mock
export const mockContractor = {
  email: 'winston@continental.com',
  password: 'continental123',
  nickname: 'Winston Scott',
  role: 'contractor' as const,
  coins: 150000
};

// Usuarios contratistas adicionales mock
export const mockContractors = [
  mockContractor,
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
    email: 'adjudicator@highTable.com',
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

// Misiones públicas mock
export const mockPublicMissions: Contract[] = [
  {
    id: 'mission-001',
    title: 'Eliminar a Marcus Valerio',
    description: 'Objetivo de alta prioridad en Nueva York. Ex-miembro de la Alta Mesa que ha violado el código. Requiere discreción absoluta y experiencia en combate urbano.',
    reward: 75000,
    status: 'open',
    terminado: false,
    contractorId: btoa('winston@continental.com'),
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-11-05'),
    isPrivate: false,
    location: 'Nueva York, USA',
    deadline: '2024-12-15'
  },
  {
    id: 'mission-002',
    title: 'Recuperar artefacto robado',
    description: 'Un medallón de oro antiguo fue robado del Continental de Casablanca. El ladrón se encuentra en Marrakech. Recuperación sin daños al objeto.',
    reward: 50000,
    status: 'open',
    terminado: false,
    contractorId: btoa('sofia@casablanca.com'),
    createdAt: new Date('2024-11-06'),
    updatedAt: new Date('2024-11-06'),
    isPrivate: false,
    location: 'Marrakech, Marruecos',
    deadline: '2024-11-25'
  },
  {
    id: 'mission-003',
    title: 'Neutralizar red de tráfico',
    description: 'Desmantelar operación de tráfico ilegal en los muelles de Nueva York. Múltiples objetivos. Se requiere equipo o asesino con experiencia en operaciones complejas.',
    reward: 120000,
    status: 'negotiating',
    terminado: false,
    contractorId: btoa('bowery@king.com'),
    createdAt: new Date('2024-11-04'),
    updatedAt: new Date('2024-11-08'),
    isPrivate: false,
    location: 'Nueva York, USA',
    deadline: '2024-12-01',
    negotiation: {
      id: 'neg-001',
      contractId: 'mission-003',
      proposedBy: 'assassin',
      proposedByEmail: 'caine@assassins.com',
      proposedByName: 'Caine',
      proposedReward: 150000,
      message: 'Dada la complejidad de la operación y el número de objetivos, propongo un ajuste en la recompensa.',
      status: 'pending',
      createdAt: new Date('2024-11-08').toISOString()
    }
  },
  {
    id: 'mission-004',
    title: 'Eliminar a traidor de la Alta Mesa',
    description: 'Un miembro de la Alta Mesa ha traicionado el código y debe ser eliminado. Objetivo altamente protegido en Berlín. Solo asesinos de élite.',
    reward: 200000,
    status: 'open',
    terminado: false,
    contractorId: btoa('adjudicator@highTable.com'),
    createdAt: new Date('2024-11-07'),
    updatedAt: new Date('2024-11-07'),
    isPrivate: false,
    location: 'Berlín, Alemania',
    deadline: '2024-12-20'
  },
  {
    id: 'mission-005',
    title: 'Protección de testigo clave',
    description: 'Proteger a un testigo durante 48 horas mientras se traslada de París a Roma. Amenazas confirmadas de múltiples organizaciones.',
    reward: 85000,
    status: 'open',
    terminado: false,
    contractorId: btoa('winston@continental.com'),
    createdAt: new Date('2024-11-08'),
    updatedAt: new Date('2024-11-08'),
    isPrivate: false,
    location: 'París - Roma',
    deadline: '2024-11-18'
  },
  {
    id: 'mission-006',
    title: 'Infiltración en subasta clandestina',
    description: 'Infiltrarse en subasta de armas en Dubái y eliminar al organizador. Requiere habilidades sociales y combate.',
    reward: 95000,
    status: 'open',
    terminado: false,
    contractorId: btoa('elder@desert.com'),
    createdAt: new Date('2024-11-03'),
    updatedAt: new Date('2024-11-03'),
    isPrivate: false,
    location: 'Dubái, EAU',
    deadline: '2024-11-30'
  },
  {
    id: 'mission-007',
    title: 'Eliminar a sicario renegado',
    description: 'Ex-asesino de la organización que ahora trabaja por su cuenta. Conoce nuestros métodos. Extremadamente peligroso.',
    reward: 110000,
    status: 'open',
    terminado: false,
    contractorId: btoa('bowery@king.com'),
    createdAt: new Date('2024-11-02'),
    updatedAt: new Date('2024-11-02'),
    isPrivate: false,
    location: 'Tokio, Japón',
    deadline: '2024-12-10'
  },
  {
    id: 'mission-008',
    title: 'Rescate de rehén en zona de guerra',
    description: 'Diplomático secuestrado en zona de conflicto. Rescate y extracción segura. Alto riesgo, alta recompensa.',
    reward: 180000,
    status: 'open',
    terminado: false,
    contractorId: btoa('adjudicator@highTable.com'),
    createdAt: new Date('2024-11-09'),
    updatedAt: new Date('2024-11-09'),
    isPrivate: false,
    location: 'Medio Oriente',
    deadline: '2024-11-20'
  },
  {
    id: 'mission-009',
    title: 'Sabotaje de operación rival',
    description: 'Sabotear operación de organización rival sin dejar rastros. Requiere sigilo y precisión quirúrgica.',
    reward: 65000,
    status: 'open',
    terminado: false,
    contractorId: btoa('sofia@casablanca.com'),
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
    isPrivate: false,
    location: 'Londres, UK',
    deadline: '2024-11-28'
  },
  {
    id: 'mission-010',
    title: 'Eliminar a líder de cartel',
    description: 'Líder de cartel mexicano con fuerte protección. Operación en territorio hostil. Se requiere experiencia en operaciones en Latinoamérica.',
    reward: 140000,
    status: 'negotiating',
    terminado: false,
    contractorId: btoa('elder@desert.com'),
    createdAt: new Date('2024-10-30'),
    updatedAt: new Date('2024-11-07'),
    isPrivate: false,
    location: 'Ciudad de México, México',
    deadline: '2024-12-05',
    negotiation: {
      id: 'neg-002',
      contractId: 'mission-010',
      proposedBy: 'assassin',
      proposedByEmail: 'zero@assassins.com',
      proposedByName: 'Zero',
      proposedReward: 160000,
      message: 'El nivel de seguridad del objetivo es mayor de lo estimado. Necesito recursos adicionales.',
      status: 'pending',
      createdAt: new Date('2024-11-07').toISOString()
    }
  },
  {
    id: 'mission-011',
    title: 'Interceptar transferencia de información',
    description: 'Interceptar y eliminar mensajero que transporta información sensible. Debe parecer accidente.',
    reward: 55000,
    status: 'open',
    terminado: false,
    contractorId: btoa('winston@continental.com'),
    createdAt: new Date('2024-11-08'),
    updatedAt: new Date('2024-11-08'),
    isPrivate: false,
    location: 'Ginebra, Suiza',
    deadline: '2024-11-22'
  },
  {
    id: 'mission-012',
    title: 'Eliminar a hacker que amenaza la red',
    description: 'Hacker ha penetrado sistemas de la organización. Localizar y eliminar antes de que venda la información.',
    reward: 90000,
    status: 'open',
    terminado: false,
    contractorId: btoa('bowery@king.com'),
    createdAt: new Date('2024-11-09'),
    updatedAt: new Date('2024-11-09'),
    isPrivate: false,
    location: 'San Francisco, USA',
    deadline: '2024-11-16'
  }
];

// Misiones de prueba para el asesino John Wick
const createAssassinMissions = () => {
  const johnWickId = btoa('johnwick@continental.com');
  const winstonId = btoa('winston@continental.com');
  const sofiaId = btoa('sofia@casablanca.com');
  
  return [
    {
      id: 'assassin-mission-001',
      title: 'Eliminar a Viktor Tarasov',
      description: 'Objetivo de alta prioridad en Nueva York. Ex-jefe de la mafia rusa que ha violado el código del Continental.',
      reward: 85000,
      status: 'in-progress',
      terminado: false,
      contractorId: winstonId,
      assassinId: johnWickId,
      createdAt: new Date('2024-11-08'),
      updatedAt: new Date('2024-11-09'),
      isPrivate: true,
      location: 'Nueva York, USA',
      deadline: '2024-11-20'
    },
    {
      id: 'assassin-mission-002',
      title: 'Recuperar medallón robado',
      description: 'Un medallón de oro antiguo fue robado del Continental de Casablanca. Recuperación sin daños al objeto.',
      reward: 60000,
      status: 'in-progress',
      terminado: false,
      contractorId: sofiaId,
      assassinId: johnWickId,
      createdAt: new Date('2024-11-07'),
      updatedAt: new Date('2024-11-08'),
      isPrivate: true,
      location: 'Marrakech, Marruecos',
      deadline: '2024-11-18'
    },
    {
      id: 'assassin-mission-003',
      title: 'Eliminar a Santino D\'Antonio',
      description: 'Misión completada exitosamente. Objetivo neutralizado en el Continental de Roma.',
      reward: 120000,
      status: 'completed',
      terminado: true,
      contractorId: winstonId,
      assassinId: johnWickId,
      createdAt: new Date('2024-10-15'),
      updatedAt: new Date('2024-10-20'),
      isPrivate: true,
      location: 'Roma, Italia',
      deadline: '2024-10-25'
    },
    {
      id: 'assassin-mission-004',
      title: 'Proteger testigo clave',
      description: 'Misión completada. Testigo trasladado exitosamente de París a Roma sin incidentes.',
      reward: 95000,
      status: 'completed',
      terminado: true,
      contractorId: sofiaId,
      assassinId: johnWickId,
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date('2024-10-05'),
      isPrivate: true,
      location: 'París - Roma',
      deadline: '2024-10-10'
    },
    {
      id: 'assassin-mission-005',
      title: 'Eliminar a Viggo Tarasov',
      description: 'Misión expirada. El objetivo escapó antes de la fecha límite.',
      reward: 150000,
      status: 'cancelled',
      terminado: false,
      contractorId: winstonId,
      assassinId: johnWickId,
      createdAt: new Date('2024-09-20'),
      updatedAt: new Date('2024-09-30'),
      isPrivate: true,
      location: 'Nueva York, USA',
      deadline: '2024-09-28'
    }
  ];
};

// Función para inicializar datos mock
export const initializeMockData = () => {
  // Verificar si ya hay datos
  const existingPublicMissions = localStorage.getItem('publicMissions');
  
  if (!existingPublicMissions) {
    // Inicializar misiones públicas
    localStorage.setItem('publicMissions', JSON.stringify(mockPublicMissions));
    console.log('✅ Misiones públicas inicializadas');
  }

  // Registrar usuarios mock si no existen
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
  
  // Registrar asesino
  if (!usersDict[mockAssassin.email]) {
    usersDict[mockAssassin.email] = mockAssassin.password;
    rolesDict[mockAssassin.email] = mockAssassin.role;
    nicknamesDict[mockAssassin.email] = mockAssassin.nickname;
    coinsDict[mockAssassin.email] = mockAssassin.coins;
    newUsersAdded++;
  }
  
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
  
  // Inicializar misiones del asesino John Wick
  const existingUserMissions = localStorage.getItem('userMissions');
  if (!existingUserMissions) {
    const assassinMissions = createAssassinMissions();
    const userMissionsDict: any = {};
    
    // Agrupar misiones por contratista
    assassinMissions.forEach(mission => {
      const contractorEmail = atob(mission.contractorId);
      if (!userMissionsDict[contractorEmail]) {
        userMissionsDict[contractorEmail] = [];
      }
      userMissionsDict[contractorEmail].push(mission);
    });
    
    localStorage.setItem('userMissions', JSON.stringify(userMissionsDict));
    console.log('✅ Misiones del asesino inicializadas');
  }
};
