// Tipos compartidos para el backend

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  nickname: string;
  role: 'admin' | 'contractor' | 'assassin';
  avatar?: string;
  coins: number;
  suspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'negotiating';
  terminado: boolean;
  contractorId: string;
  assassinId?: string;
  isPrivate: boolean;
  targetAssassinId?: string;
  location?: string;
  deadline?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Negotiation {
  id: string;
  missionId: string;
  proposedBy: 'contractor' | 'assassin';
  proposedById: string;
  proposedReward: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}

export interface Review {
  id: string;
  missionId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  missionId: string;
  reporterId: string;
  description: string;
  status: 'pending' | 'resolved' | 'cancelled';
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'payment' | 'reward';
  amount: number;
  description: string;
  relatedMissionId?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'transfer' | 'debt_request' | 'payment_request' | 'completion_request' | 'mission_assigned' | 'negotiation';
  senderId?: string;
  amount?: number;
  message?: string;
  debtId?: string;
  missionId?: string;
  read: boolean;
  createdAt: Date;
}

export interface Debt {
  id: string;
  debtorId: string;
  creditorId: string;
  favorDescription: string;
  paymentDescription?: string;
  status: 'pending' | 'active' | 'payment_requested' | 'in_progress' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface AssassinProfile {
  userId: string;
  minContractValue: number;
  specialties: string[];
  status: 'available' | 'busy' | 'inactive';
  location?: { lat: number; lng: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface TargetStatus {
  id: string;
  targetUserId: string;
  debtId: string;
  reason: string;
  markedAt: Date;
}

// Request types
export interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'contractor' | 'assassin';
}

// Express extension
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
