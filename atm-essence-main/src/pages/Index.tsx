import { useState, useEffect } from 'react';
import { ATMLogin } from '@/components/ATMLogin';
import { ATMMenu } from '@/components/ATMMenu';
import { ATMWithdraw } from '@/components/ATMWithdraw';
import { ATMDeposit } from '@/components/ATMDeposit';
import { ATMTransfer } from '@/components/ATMTransfer';
import { ATMHistory } from '@/components/ATMHistory';
import { User, Transaction, ATMScreen } from '@/types/atm';
import { getStoredTransactions, saveTransaction, getUserBalance, updateUserBalance } from '@/data/mockUsers';
import { toast } from 'sonner';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ATMScreen>('login');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (currentUser) {
      const userBalance = getUserBalance(currentUser.id);
      setBalance(userBalance);
      setTransactions(getStoredTransactions(currentUser.id));
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentScreen('menu');
  };

  const handleLogout = () => {
    toast.success('Thank you for using our ATM');
    setCurrentUser(null);
    setCurrentScreen('login');
    setBalance(0);
    setTransactions([]);
  };

  const addTransaction = (type: Transaction['type'], amount: number, description: string) => {
    if (!currentUser) return;

    const newBalance = type === 'deposit' ? balance + amount : balance - amount;
    const transaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      timestamp: new Date().toISOString(),
      description,
      balanceAfter: newBalance,
    };

    saveTransaction(currentUser.id, transaction);
    updateUserBalance(currentUser.id, newBalance);
    setBalance(newBalance);
    setTransactions([transaction, ...transactions]);
  };

  const handleWithdraw = (amount: number) => {
    addTransaction('withdraw', amount, `Cash withdrawal`);
    toast.success(`Withdrawn $${amount.toFixed(2)}`);
    setCurrentScreen('menu');
  };

  const handleDeposit = (amount: number) => {
    addTransaction('deposit', amount, `Cash deposit`);
    toast.success(`Deposited $${amount.toFixed(2)}`);
    setCurrentScreen('menu');
  };

  const handleTransfer = (amount: number, recipient: string) => {
    addTransaction('transfer', amount, `Transfer to ${recipient}`);
    toast.success(`Transferred $${amount.toFixed(2)} to ${recipient}`);
    setCurrentScreen('menu');
  };

  if (!currentUser || currentScreen === 'login') {
    return <ATMLogin onLogin={handleLogin} />;
  }

  switch (currentScreen) {
    case 'menu':
      return (
        <ATMMenu
          user={currentUser}
          balance={balance}
          onNavigate={setCurrentScreen}
          onLogout={handleLogout}
        />
      );
    case 'withdraw':
      return (
        <ATMWithdraw
          user={currentUser}
          balance={balance}
          onWithdraw={handleWithdraw}
          onBack={() => setCurrentScreen('menu')}
        />
      );
    case 'deposit':
      return (
        <ATMDeposit
          user={currentUser}
          onDeposit={handleDeposit}
          onBack={() => setCurrentScreen('menu')}
        />
      );
    case 'transfer':
      return (
        <ATMTransfer
          user={currentUser}
          balance={balance}
          onTransfer={handleTransfer}
          onBack={() => setCurrentScreen('menu')}
        />
      );
    case 'history':
      return (
        <ATMHistory
          transactions={transactions}
          onBack={() => setCurrentScreen('menu')}
        />
      );
    default:
      return null;
  }
};

export default Index;
