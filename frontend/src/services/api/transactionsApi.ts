// Servicio API para Transacciones
import api from '../apiService';
import { Transaction } from '../../types';

// Tipos de respuesta
export interface TransactionsResponse {
  transactions: Transaction[];
}

export interface TransactionResponse {
  transaction: Transaction;
}

export interface PurchaseData {
  packageId: string;
  amount: number;
  price: number;
}

export interface TransferData {
  recipientEmail: string;
  amount: number;
  message?: string;
}

// Servicio de transacciones con API real
export const transactionsApiService = {
  // Obtener todas las transacciones (admin) o propias (usuario)
  getTransactions: async (params?: { userId?: string; type?: string }): Promise<Transaction[]> => {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    const endpoint = `/transactions${query ? `?${query}` : ''}`;

    const response = await api.get<TransactionsResponse>(endpoint);
    return response.transactions;
  },

  // Obtener balance de monedas
  getBalance: async (): Promise<number> => {
    const response = await api.get<{ balance: number }>('/coins/balance');
    return response.balance;
  },

  // Comprar monedas
  purchaseCoins: async (data: PurchaseData): Promise<{ newBalance: number; transaction: Transaction }> => {
    return api.post('/coins/purchase', data);
  },

  // Transferir monedas
  transferCoins: async (data: TransferData): Promise<{ newBalance: number; transaction: Transaction }> => {
    return api.post('/coins/transfer', data);
  },
};

// ============================================
// MODO MOCK - Para desarrollo sin backend
// ============================================

import { transactionService as legacyTransactionService } from '../transactionService';
import { authService as legacyAuthService } from '../authService';

export const transactionsMockService = {
  getTransactions: async (params?: { userId?: string; type?: string }): Promise<Transaction[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let transactions = legacyTransactionService.getAll();

    if (params?.userId) {
      const email = atob(params.userId);
      transactions = transactions.filter((t) => t.userEmail === email);
    }

    if (params?.type) {
      transactions = transactions.filter((t) => t.type === params.type);
    }

    return transactions;
  },

  getBalance: async (): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return legacyAuthService.getCoins(currentUser.email);
  },

  purchaseCoins: async (data: PurchaseData): Promise<{ newBalance: number; transaction: Transaction }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Agregar monedas
    legacyAuthService.updateCoins(currentUser.email, data.amount);

    // Registrar transacción
    const transaction = legacyTransactionService.addPurchase(
      currentUser.email,
      currentUser.nickname,
      data.amount,
      data.price
    );

    const newBalance = legacyAuthService.getCoins(currentUser.email);

    // Actualizar usuario en localStorage
    currentUser.coins = newBalance;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    return { newBalance, transaction };
  },

  transferCoins: async (data: TransferData): Promise<{ newBalance: number; transaction: Transaction }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Verificar balance
    const currentBalance = legacyAuthService.getCoins(currentUser.email);
    if (currentBalance < data.amount) {
      throw new Error('Insufficient balance');
    }

    // Obtener nombre del receptor
    const nicknames = JSON.parse(localStorage.getItem('nicknames') || '{}');
    const recipientName = nicknames[data.recipientEmail] || data.recipientEmail;

    // Realizar transferencia
    legacyAuthService.updateCoins(currentUser.email, -data.amount);
    legacyAuthService.updateCoins(data.recipientEmail, data.amount);

    // Registrar transacciones
    const { senderTransaction } = legacyTransactionService.addTransfer(
      currentUser.email,
      currentUser.nickname,
      data.recipientEmail,
      recipientName,
      data.amount,
      data.message
    );

    const newBalance = legacyAuthService.getCoins(currentUser.email);

    // Actualizar usuario en localStorage
    currentUser.coins = newBalance;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    return { newBalance, transaction: senderTransaction };
  },
};

// Exportar servicio según modo
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;
export const transactionsService = USE_MOCK ? transactionsMockService : transactionsApiService;

export default transactionsService;
