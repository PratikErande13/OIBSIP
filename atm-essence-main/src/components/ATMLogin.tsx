import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types/atm';
import { DEMO_USERS } from '@/data/mockUsers';
import { toast } from 'sonner';
import { CreditCard, Lock } from 'lucide-react';

interface ATMLoginProps {
  onLogin: (user: User) => void;
}

export const ATMLogin = ({ onLogin }: ATMLoginProps) => {
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.id === userId && u.pin === pin);
      
      if (user) {
        toast.success(`Welcome, ${user.name}!`);
        onLogin(user);
      } else {
        toast.error('Invalid User ID or PIN');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-atm-border shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
              <CreditCard className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">ATM System</h1>
            <p className="text-muted-foreground">Insert your card and enter PIN</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-foreground">User ID</Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                className="h-12 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className="text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                PIN
              </Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                maxLength={4}
                className="h-12 text-lg tracking-widest"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>ID: 1001 | PIN: 1234</p>
              <p>ID: 1002 | PIN: 5678</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
