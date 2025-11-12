import { User } from '../types';

// Diccionario de usuarios: email -> password
const getUsersDict = (): Record<string, string> => {
  const stored = localStorage.getItem('users');
  return stored ? JSON.parse(stored) : {};
};

const setUsersDict = (users: Record<string, string>) => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Diccionario de roles: email -> role
const getRolesDict = (): Record<string, 'admin' | 'contractor' | 'assassin'> => {
  const stored = localStorage.getItem('roles');
  return stored ? JSON.parse(stored) : {};
};

const setRolesDict = (roles: Record<string, 'admin' | 'contractor' | 'assassin'>) => {
  localStorage.setItem('roles', JSON.stringify(roles));
};

// Diccionario de nicknames: email -> nickname
const getNicknamesDict = (): Record<string, string> => {
  const stored = localStorage.getItem('nicknames');
  return stored ? JSON.parse(stored) : {};
};

const setNicknamesDict = (nicknames: Record<string, string>) => {
  localStorage.setItem('nicknames', JSON.stringify(nicknames));
};

// Diccionario de monedas: email -> coins
const getCoinsDict = (): Record<string, number> => {
  const stored = localStorage.getItem('coins');
  return stored ? JSON.parse(stored) : {};
};

const setCoinsDict = (coins: Record<string, number>) => {
  localStorage.setItem('coins', JSON.stringify(coins));
};

// Diccionario de misiones: email -> Contract[]
const getMissionsDict = (): Record<string, any[]> => {
  const stored = localStorage.getItem('userMissions');
  return stored ? JSON.parse(stored) : {};
};

const setMissionsDict = (missions: Record<string, any[]>) => {
  localStorage.setItem('userMissions', JSON.stringify(missions));
};

// Misiones de ejemplo para nuevos usuarios
const createSampleMissions = (email: string) => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 días atrás
  
  const targets = [
    'Harrison Zuleta Montoya',
    'Herrinson Zuluaga Mora',
    'Carlos Mendez',
    'Ana Rodriguez',
    'Miguel Santos'
  ];
  
  const assassins = [
    'Shadow Hunter',
    'Night Blade',
    'Silent Death',
    'Dark Phoenix',
    'Ghost Reaper'
  ];
  
  const randomTarget1 = targets[Math.floor(Math.random() * targets.length)];
  const randomTarget2 = targets.filter(t => t !== randomTarget1)[Math.floor(Math.random() * (targets.length - 1))];
  const randomAssassin1 = assassins[Math.floor(Math.random() * assassins.length)];
  const randomAssassin2 = assassins.filter(a => a !== randomAssassin1)[Math.floor(Math.random() * (assassins.length - 1))];
  
  return [
    {
      id: `${Date.now()}-1`,
      title: `Eliminar a ${randomTarget1}`,
      description: 'Objetivo de alta prioridad. Requiere discreción absoluta.',
      reward: 50000,
      status: 'in_progress',
      terminado: false,
      contractorId: btoa(email),
      assassinId: '2',
      assassinName: randomAssassin1,
      createdAt: pastDate.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: `${Date.now()}-2`,
      title: `Eliminar a ${randomTarget2}`,
      description: 'Misión completada exitosamente. Objetivo neutralizado.',
      reward: 35000,
      status: 'completed',
      terminado: true,
      contractorId: btoa(email),
      assassinId: '3',
      assassinName: randomAssassin2,
      createdAt: new Date(pastDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: pastDate.toISOString()
    }
  ];
};

export const authService = {
  register: (email: string, password: string, nickname: string, role: 'admin' | 'contractor' | 'assassin'): boolean => {
    const users = getUsersDict();
    
    // Verificar si el usuario ya existe
    if (users[email]) {
      return false;
    }

    // Guardar usuario
    users[email] = password;
    setUsersDict(users);

    // Guardar rol
    const roles = getRolesDict();
    roles[email] = role;
    setRolesDict(roles);

    // Guardar nickname
    const nicknames = getNicknamesDict();
    nicknames[email] = nickname;
    setNicknamesDict(nicknames);

    // Inicializar monedas (todos empiezan con 1000 monedas)
    const coins = getCoinsDict();
    coins[email] = 1000;
    setCoinsDict(coins);

    // Crear misiones de ejemplo para el nuevo usuario
    const missions = getMissionsDict();
    missions[email] = createSampleMissions(email);
    setMissionsDict(missions);

    return true;
  },

  login: (email: string, password: string): User | null => {
    const users = getUsersDict();
    const roles = getRolesDict();
    const nicknames = getNicknamesDict();
    const coins = getCoinsDict();

    // Verificar credenciales
    if (users[email] !== password) {
      return null;
    }

    // Si el usuario no tiene monedas, inicializar con 1000
    if (coins[email] === undefined) {
      coins[email] = 1000;
      setCoinsDict(coins);
    }

    // Crear objeto de usuario
    const user: User = {
      id: btoa(email), // ID simple basado en email
      email,
      name: nicknames[email] || email,
      nickname: nicknames[email] || email,
      role: roles[email] || 'contractor',
      coins: coins[email] || 1000
    };

    // Guardar sesión
    localStorage.setItem('currentUser', JSON.stringify(user));

    return user;
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('currentUser');
  },

  updateCoins: (email: string, amount: number): boolean => {
    const coins = getCoinsDict();
    const currentAmount = coins[email] || 0;
    
    // No permitir saldo negativo
    if (currentAmount + amount < 0) {
      return false;
    }

    coins[email] = currentAmount + amount;
    setCoinsDict(coins);

    // Actualizar usuario actual si es el mismo
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.email === email) {
      currentUser.coins = coins[email];
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    return true;
  },

  getCoins: (email: string): number => {
    const coins = getCoinsDict();
    return coins[email] || 0;
  },

  // Gestión de misiones
  getUserMissions: (email: string): any[] => {
    const missions = getMissionsDict();
    if (!missions[email]) {
      // Si no tiene misiones, crear las de ejemplo
      missions[email] = createSampleMissions(email);
      setMissionsDict(missions);
    }
    return missions[email] || [];
  },

  addMission: (email: string, mission: any): void => {
    const missions = getMissionsDict();
    if (!missions[email]) {
      missions[email] = [];
    }
    missions[email].unshift(mission); // Agregar al inicio
    setMissionsDict(missions);
  },

  updateMission: (email: string, missionId: string, updates: any): void => {
    const missions = getMissionsDict();
    if (missions[email]) {
      missions[email] = missions[email].map(m => 
        m.id === missionId ? { ...m, ...updates } : m
      );
      setMissionsDict(missions);
    }
  },

  deleteMission: (email: string, missionId: string): void => {
    const missions = getMissionsDict();
    if (missions[email]) {
      missions[email] = missions[email].filter(m => m.id !== missionId);
      setMissionsDict(missions);
    }
  },

  // Gestión de reportes
  getReports: (): any[] => {
    const stored = localStorage.getItem('reports');
    return stored ? JSON.parse(stored) : [];
  },

  addReport: (report: any): void => {
    const reports = authService.getReports();
    reports.unshift(report);
    localStorage.setItem('reports', JSON.stringify(reports));
  },

  updateReport: (reportId: string, updates: any): void => {
    const reports = authService.getReports();
    const updatedReports = reports.map(r => 
      r.id === reportId ? { ...r, ...updates } : r
    );
    localStorage.setItem('reports', JSON.stringify(updatedReports));
  },

  deleteReport: (reportId: string): void => {
    const reports = authService.getReports();
    const filteredReports = reports.filter(r => r.id !== reportId);
    localStorage.setItem('reports', JSON.stringify(filteredReports));
  },

  // Gestión de misiones públicas
  getPublicMissions: (): any[] => {
    const stored = localStorage.getItem('publicMissions');
    return stored ? JSON.parse(stored) : [];
  },

  addPublicMission: (mission: any): void => {
    const missions = authService.getPublicMissions();
    missions.unshift(mission);
    localStorage.setItem('publicMissions', JSON.stringify(missions));
  },

  updatePublicMission: (missionId: string, updates: any): void => {
    const missions = authService.getPublicMissions();
    const updatedMissions = missions.map(m => 
      m.id === missionId ? { ...m, ...updates } : m
    );
    localStorage.setItem('publicMissions', JSON.stringify(updatedMissions));
  },

  deletePublicMission: (missionId: string): void => {
    const missions = authService.getPublicMissions();
    const filteredMissions = missions.filter(m => m.id !== missionId);
    localStorage.setItem('publicMissions', JSON.stringify(filteredMissions));
  },

  // Gestión de negociaciones
  getNegotiations: (userEmail: string): any[] => {
    const stored = localStorage.getItem('negotiations');
    const allNegotiations = stored ? JSON.parse(stored) : [];
    
    // Filtrar negociaciones relevantes para el usuario
    return allNegotiations.filter((neg: any) => {
      const mission = authService.getPublicMissions().find(m => m.id === neg.contractId) ||
                     authService.getAllMissions().find(m => m.id === neg.contractId);
      
      if (!mission) return false;
      
      // Mostrar si el usuario es el contratista o el asesino involucrado
      return mission.contractorId === btoa(userEmail) || 
             neg.proposedByEmail === userEmail ||
             mission.targetAssassinId === userEmail;
    });
  },

  addNegotiation: (negotiation: any): void => {
    const stored = localStorage.getItem('negotiations');
    const negotiations = stored ? JSON.parse(stored) : [];
    negotiations.unshift(negotiation);
    localStorage.setItem('negotiations', JSON.stringify(negotiations));
  },

  updateNegotiation: (negotiationId: string, updates: any): void => {
    const stored = localStorage.getItem('negotiations');
    const negotiations = stored ? JSON.parse(stored) : [];
    const updatedNegotiations = negotiations.map((n: any) => 
      n.id === negotiationId ? { ...n, ...updates } : n
    );
    localStorage.setItem('negotiations', JSON.stringify(updatedNegotiations));
  },

  getAllMissions: (): any[] => {
    const missionsDict = getMissionsDict();
    const allMissions: any[] = [];
    
    Object.values(missionsDict).forEach(userMissions => {
      allMissions.push(...userMissions);
    });
    
    return allMissions;
  },

  getMissionById: (missionId: string): any | null => {
    // Buscar en misiones públicas
    const publicMissions = authService.getPublicMissions();
    const publicMission = publicMissions.find(m => m.id === missionId);
    if (publicMission) return publicMission;
    
    // Buscar en misiones privadas
    const allMissions = authService.getAllMissions();
    return allMissions.find(m => m.id === missionId) || null;
  },

  // Gestión de usuarios (para administradores)
  getAllUsers: (): User[] => {
    const usersDict = getUsersDict();
    const rolesDict = getRolesDict();
    const nicknamesDict = getNicknamesDict();
    const coinsDict = getCoinsDict();

    return Object.keys(usersDict).map(email => ({
      id: btoa(email),
      email,
      name: nicknamesDict[email] || email.split('@')[0],
      role: rolesDict[email] || 'contractor',
      nickname: nicknamesDict[email],
      coins: coinsDict[email] || 0
    }));
  },

  getAllAssassins: (): User[] => {
    const allUsers = authService.getAllUsers();
    return allUsers.filter(user => user.role === 'assassin');
  },

  updateUserRole: (email: string, newRole: 'admin' | 'contractor' | 'assassin'): boolean => {
    const roles = getRolesDict();
    if (!roles[email]) {
      return false;
    }
    roles[email] = newRole;
    setRolesDict(roles);
    return true;
  },

  deleteUser: (email: string): boolean => {
    const users = getUsersDict();
    const roles = getRolesDict();
    const nicknames = getNicknamesDict();
    const coins = getCoinsDict();
    const missions = getMissionsDict();

    if (!users[email]) {
      return false;
    }

    // Eliminar de todos los diccionarios
    delete users[email];
    delete roles[email];
    delete nicknames[email];
    delete coins[email];
    delete missions[email];

    setUsersDict(users);
    setRolesDict(roles);
    setNicknamesDict(nicknames);
    setCoinsDict(coins);
    setMissionsDict(missions);

    return true;
  },

  suspendUser: (email: string): boolean => {
    const suspended = localStorage.getItem('suspendedUsers');
    const suspendedList = suspended ? JSON.parse(suspended) : [];
    
    if (!suspendedList.includes(email)) {
      suspendedList.push(email);
      localStorage.setItem('suspendedUsers', JSON.stringify(suspendedList));
    }
    
    return true;
  },

  unsuspendUser: (email: string): boolean => {
    const suspended = localStorage.getItem('suspendedUsers');
    const suspendedList = suspended ? JSON.parse(suspended) : [];
    
    const filtered = suspendedList.filter((e: string) => e !== email);
    localStorage.setItem('suspendedUsers', JSON.stringify(filtered));
    
    return true;
  },

  isSuspended: (email: string): boolean => {
    const suspended = localStorage.getItem('suspendedUsers');
    const suspendedList = suspended ? JSON.parse(suspended) : [];
    return suspendedList.includes(email);
  }
};
