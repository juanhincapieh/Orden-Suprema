// Tipos compartidos para el frontend

export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  role: 'admin' | 'contractor' | 'assassin';
  avatar?: string;
  coins: number;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'negotiating';
  terminado: boolean;
  contractorId: string;
  assassinId?: string;
  assassinName?: string;
  createdAt: Date;
  updatedAt: Date;
  review?: Review;
  isPrivate?: boolean;
  targetAssassinId?: string;
  location?: string;
  deadline?: string;
  negotiation?: Negotiation;
}

export interface Negotiation {
  id: string;
  contractId: string;
  proposedBy: 'contractor' | 'assassin';
  proposedByEmail: string;
  proposedByName: string;
  proposedReward: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

export interface Review {
  id: string;
  contractId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Assassin {
  id: string;
  name: string;
  email: string;
  rating: number;
  completedContracts: number;
  location?: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'busy' | 'inactive';
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'purchase' | 'payment' | 'reward';
  amount: number;
  description: string;
  date: Date;
}

export interface Report {
  id: string;
  contractId: string;
  contractTitle: string;
  reporterEmail: string;
  reporterName: string;
  description: string;
  status: 'pending' | 'resolved' | 'cancelled';
  createdAt: Date;
}
