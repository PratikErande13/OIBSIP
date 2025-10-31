export interface User {
  id: string;
  pin: string;
  name: string;
  balance: number;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  type: 'withdraw' | 'deposit' | 'transfer';
  amount: number;
  timestamp: string;
  description: string;
  balanceAfter: number;
}

export type ATMScreen = 'login' | 'menu' | 'withdraw' | 'deposit' | 'transfer' | 'history';
