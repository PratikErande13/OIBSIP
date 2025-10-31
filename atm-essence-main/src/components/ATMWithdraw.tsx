import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, ATMScreen } from '@/types/atm';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface ATMWithdrawProps {
  user: User;
  balance: number;
  onWithdraw: (amount: number) => void;
  onBack: () => void;
}

export const ATMWithdraw = ({ balance, onWithdraw, onBack }: ATMWithdrawProps) => {
  const [customAmount, setCustomAmount] = useState('');
  const quickAmounts = [20, 50, 100, 200, 500];

  const handleWithdraw = (amount: number) => {
    if (amount > balance) {
      toast.error('Insufficient funds');
      return;
    }
    if (amount <= 0) {
      toast.error('Invalid amount');
      return;
    }
    onWithdraw(amount);
    setCustomAmount('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent p-4">
      <Card className="w-full max-w-2xl bg-card/95 backdrop-blur-sm border-atm-border shadow-2xl">
        <div className="p-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>

          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
              <DollarSign className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Withdraw Cash</h2>
            <p className="text-muted-foreground">Available Balance: ${balance.toFixed(2)}</p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Quick Amounts</p>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => handleWithdraw(amount)}
                  variant="outline"
                  className="h-16 text-lg font-semibold hover:bg-primary hover:text-primary-foreground"
                  disabled={amount > balance}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Custom Amount</p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="h-12 text-lg"
                min="1"
                max={balance}
              />
              <Button
                onClick={() => handleWithdraw(parseFloat(customAmount))}
                className="h-12 px-8"
                disabled={!customAmount || parseFloat(customAmount) <= 0}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
