import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@/types/atm';
import { ATMScreen } from '@/types/atm';
import { History, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, LogOut, Wallet } from 'lucide-react';

interface ATMMenuProps {
  user: User;
  balance: number;
  onNavigate: (screen: ATMScreen) => void;
  onLogout: () => void;
}

export const ATMMenu = ({ user, balance, onNavigate, onLogout }: ATMMenuProps) => {
  const menuItems = [
    { icon: History, label: 'Transaction History', screen: 'history' as ATMScreen },
    { icon: ArrowDownToLine, label: 'Withdraw', screen: 'withdraw' as ATMScreen },
    { icon: ArrowUpFromLine, label: 'Deposit', screen: 'deposit' as ATMScreen },
    { icon: ArrowRightLeft, label: 'Transfer', screen: 'transfer' as ATMScreen },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent p-4">
      <Card className="w-full max-w-2xl bg-card/95 backdrop-blur-sm border-atm-border shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
              <Wallet className="w-8 h-8 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome, {user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.accountNumber}</p>
          </div>

          {/* Balance Display */}
          <div className="mb-8 p-6 bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg">
            <p className="text-sm text-primary-foreground/80 mb-1">Current Balance</p>
            <p className="text-4xl font-bold text-primary-foreground">${balance.toFixed(2)}</p>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {menuItems.map((item) => (
              <Button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <item.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            ))}
          </div>

          {/* Logout Button */}
          <Button
            onClick={onLogout}
            variant="destructive"
            className="w-full h-12 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Quit
          </Button>
        </div>
      </Card>
    </div>
  );
};
