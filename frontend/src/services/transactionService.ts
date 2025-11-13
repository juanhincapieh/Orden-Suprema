import { Transaction } from '../types';

const TRANSACTIONS_KEY = 'transactions';

const getTransactions = (): Transaction[] => {
  const transactionsStr = localStorage.getItem(TRANSACTIONS_KEY);
  if (!transactionsStr) {
    return [];
  }
  
  try {
    const transactions = JSON.parse(transactionsStr);
    // Convertir las fechas de string a Date
    return transactions.map((t: any) => ({
      ...t,
      date: new Date(t.date)
    }));
  } catch {
    return [];
  }
};

const setTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const transactionService = {
  getAll: (): Transaction[] => {
    return getTransactions();
  },

  add: (transaction: Omit<Transaction, 'id'>): Transaction => {
    const transactions = getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    
    transactions.unshift(newTransaction); // Agregar al inicio para que aparezca primero
    setTransactions(transactions);
    
    return newTransaction;
  },

  addPurchase: (userEmail: string, userName: string, amount: number, packagePrice: number): Transaction => {
    return transactionService.add({
      userId: btoa(userEmail),
      userEmail,
      userName,
      type: 'purchase',
      amount: amount,
      description: `Compra de ${amount.toLocaleString()} monedas por $${packagePrice}`,
      date: new Date()
    });
  },

  addPayment: (userEmail: string, userName: string, amount: number, description: string): Transaction => {
    return transactionService.add({
      userId: btoa(userEmail),
      userEmail,
      userName,
      type: 'payment',
      amount: -amount, // Negativo porque es un pago
      description,
      date: new Date()
    });
  },

  addReward: (userEmail: string, userName: string, amount: number, description: string): Transaction => {
    return transactionService.add({
      userId: btoa(userEmail),
      userEmail,
      userName,
      type: 'reward',
      amount: amount,
      description,
      date: new Date()
    });
  },

  addTransfer: (
    fromEmail: string,
    fromName: string,
    toEmail: string,
    toName: string,
    amount: number,
    message?: string
  ): { senderTransaction: Transaction; receiverTransaction: Transaction } => {
    const description = message 
      ? `Transferencia a ${toName}: ${message}`
      : `Transferencia a ${toName}`;
    
    const receiverDescription = message
      ? `Transferencia de ${fromName}: ${message}`
      : `Transferencia de ${fromName}`;

    // Transacción del remitente (negativa)
    const senderTransaction = transactionService.add({
      userId: btoa(fromEmail),
      userEmail: fromEmail,
      userName: fromName,
      type: 'payment',
      amount: -amount,
      description,
      date: new Date()
    });

    // Transacción del receptor (positiva)
    const receiverTransaction = transactionService.add({
      userId: btoa(toEmail),
      userEmail: toEmail,
      userName: toName,
      type: 'reward',
      amount: amount,
      description: receiverDescription,
      date: new Date()
    });

    return { senderTransaction, receiverTransaction };
  },

  getByUser: (userEmail: string): Transaction[] => {
    const transactions = getTransactions();
    return transactions.filter(t => t.userEmail === userEmail);
  },

  clear: (): void => {
    localStorage.removeItem(TRANSACTIONS_KEY);
  }
};
