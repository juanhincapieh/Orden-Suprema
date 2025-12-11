// Coins & Transactions API Service - Supports both mock and real backend
import { api, USE_MOCK, getCurrentUserEmail } from './index';
import { Transaction } from '../../types';

// ============================================
// MOCK IMPLEMENTATION
// ============================================

const mockCoinsService = {
  // Obtener balance
  getBalance: async (): Promise<number> => {
    const email = getCurrentUserEmail();
    if (!email) return 0;
    
    const coins = JSON.parse(localStorage.getItem('coins') || '{}');
    return coins[email] || 0;
  },

  // Comprar monedas
  purchaseCoins: async (amount: number, packageId?: string): Promise<{ newBalance: number; transaction: Transaction }> => {
    const email = getCurrentUserEmail();
    if (!email) throw new Error('Not authenticated');
    
    const coins = JSON.parse(localStorage.getItem('coins') || '{}');
    const oldBalance = coins[email] || 0;
    const newBalance = oldBalance + amount;
    
    coins[email] = newBalance;
    localStorage.setItem('coins', JSON.stringify(coins));
    
    // Actualizar currentUser
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.coins = newBalance;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Crear transacción
    const transaction: Transaction = {
      id: Date.now().toString(),
      userId: btoa(email),
      userEmail: email,
      userName: currentUser.nickname || email,
      type: 'purchase',
      amount,
      description: `Compra de ${amount.toLocaleString()} monedas (Paquete: ${packageId || 'custom'})`,
      date: new Date(),
    };
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    return { newBalance, transaction };
  },

  // Transferir monedas
  transferCoins: async (
    recipientEmail: string,
    amount: number,
    message?: string
  ): Promise<{ newBalance: number; transaction: Transaction }> => {
    const email = getCurrentUserEmail();
    if (!email) throw new Error('Not authenticated');
    
    const coins = JSON.parse(localStorage.getItem('coins') || '{}');
    const senderBalance = coins[email] || 0;
    
    if (senderBalance < amount) {
      throw new Error('Insufficient funds');
    }
    
    // Descontar del remitente
    coins[email] = senderBalance - amount;
    
    // Agregar al receptor
    const recipientBalance = coins[recipientEmail] || 0;
    coins[recipientEmail] = recipientBalance + amount;
    
    localStorage.setItem('coins', JSON.stringify(coins));
    
    // Actualizar currentUser
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.coins = coins[email];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Obtener nombres
    const nicknames = JSON.parse(localStorage.getItem('nicknames') || '{}');
    const senderName = currentUser.nickname || email;
    const recipientName = nicknames[recipientEmail] || recipientEmail;
    
    // Crear transacciones
    const senderTransaction: Transaction = {
      id: Date.now().toString(),
      userId: btoa(email),
      userEmail: email,
      userName: senderName,
      type: 'payment',
      amount: -amount,
      description: `Transferencia a ${recipientName}${message ? `: ${message}` : ''}`,
      date: new Date(),
    };
    
    const recipientTransaction: Transaction = {
      id: (Date.now() + 1).toString(),
      userId: btoa(recipientEmail),
      userEmail: recipientEmail,
      userName: recipientName,
      type: 'reward',
      amount,
      description: `Transferencia de ${senderName}${message ? `: ${message}` : ''}`,
      date: new Date(),
    };
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.unshift(senderTransaction, recipientTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Crear notificación para el receptor
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift({
      id: Date.now().toString(),
      recipientEmail,
      type: 'transfer',
      senderEmail: email,
      senderName,
      amount,
      message: message || `Has recibido ${amount} monedas de ${senderName}`,
      createdAt: new Date().toISOString(),
      read: false,
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    return { newBalance: coins[email], transaction: senderTransaction };
  },

  // Obtener transacciones
  getTransactions: async (): Promise<Transaction[]> => {
    const email = getCurrentUserEmail();
    if (!email) return [];
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return transactions
      .filter((t: any) => t.userEmail === email)
      .map((t: any) => ({
        ...t,
        date: new Date(t.date),
      }));
  },

  // Obtener todas las transacciones (admin)
  getAllTransactions: async (): Promise<Transaction[]> => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return transactions.map((t: any) => ({
      ...t,
      date: new Date(t.date),
    }));
  },

  // Actualizar monedas de un usuario (interno)
  updateUserCoins: async (email: string, amount: number): Promise<number> => {
    const coins = JSON.parse(localStorage.getItem('coins') || '{}');
    const currentBalance = coins[email] || 0;
    const newBalance = currentBalance + amount;
    
    if (newBalance < 0) {
      throw new Error('Insufficient funds');
    }
    
    coins[email] = newBalance;
    localStorage.setItem('coins', JSON.stringify(coins));
    
    // Actualizar currentUser si es el mismo
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.email === email) {
      currentUser.coins = newBalance;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    return newBalance;
  },
};

// ============================================
// REAL API IMPLEMENTATION
// ============================================

const realCoinsService = {
  getBalance: async (): Promise<number> => {
    const response = await api.get<{ balance: number }>('/coins/balance');
    return response.balance;
  },

  purchaseCoins: async (amount: number, packageId?: string): Promise<{ newBalance: number; transaction: Transaction }> => {
    const response = await api.post<{ newBalance: number; transaction: Transaction }>('/coins/purchase', {
      amount,
      packageId,
    });
    return response;
  },

  transferCoins: async (
    recipientEmail: string,
    amount: number,
    message?: string
  ): Promise<{ newBalance: number; transaction: Transaction }> => {
    const response = await api.post<{ newBalance: number; transaction: Transaction }>('/coins/transfer', {
      recipientEmail,
      amount,
      message,
    });
    return response;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get<{ transactions: Transaction[] }>('/transactions');
    return response.transactions.map(t => ({
      ...t,
      date: new Date(t.date),
    }));
  },

  getAllTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get<{ transactions: Transaction[] }>('/transactions');
    return response.transactions.map(t => ({
      ...t,
      date: new Date(t.date),
    }));
  },

  updateUserCoins: async (_email: string, _amount: number): Promise<number> => {
    // En el backend real, esto se maneja internamente
    throw new Error('Use transferCoins or purchaseCoins instead');
  },
};

// ============================================
// EXPORT
// ============================================

export const coinsApi = USE_MOCK ? mockCoinsService : realCoinsService;
export default coinsApi;
