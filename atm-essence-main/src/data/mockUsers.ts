import { User, Transaction } from '@/types/atm';

export const DEMO_USERS: User[] = [
  {
    id: '1001',
    pin: '1234',
    name: 'John Doe',
    balance: 5000,
    accountNumber: '4532-1234-5678-9012'
  },
  {
    id: '1002',
    pin: '5678',
    name: 'Jane Smith',
    balance: 7500,
    accountNumber: '4532-9876-5432-1098'
  }
];

export const getStoredTransactions = (userId: string): Transaction[] => {
  const stored = localStorage.getItem(`transactions_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransaction = (userId: string, transaction: Transaction) => {
  const transactions = getStoredTransactions(userId);
  transactions.unshift(transaction);
  localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions.slice(0, 50)));
};

export const getUserBalance = (userId: string): number => {
  const stored = localStorage.getItem(`balance_${userId}`);
  const user = DEMO_USERS.find(u => u.id === userId);
  return stored ? parseFloat(stored) : (user?.balance || 0);
};

export const updateUserBalance = (userId: string, newBalance: number) => {
  localStorage.setItem(`balance_${userId}`, newBalance.toString());
};
