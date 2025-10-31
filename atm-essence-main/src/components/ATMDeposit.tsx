import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/atm';
import { ArrowLeft, PiggyBank } from 'lucide-react';
import { toast } from 'sonner';

interface ATMDepositProps {
  user: User;
  onDeposit: (amount: number) => void;
  onBack: () => void;
}

export const ATMDeposit = ({ onDeposit, onBack }: ATMDepositProps) => {
  const [amount, setAmount] = useState('');

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0 || isNaN(depositAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }
    onDeposit(depositAmount);
    setAmount('');
  };

  const quickAmounts = [50, 100, 200, 500, 1000];

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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
              <PiggyBank className="w-8 h-8 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Deposit Cash</h2>
            <p className="text-muted-foreground">Insert cash or enter amount</p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Quick Amounts</p>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  onClick={() => {
                    onDeposit(quickAmount);
                  }}
                  variant="outline"
                  className="h-16 text-lg font-semibold hover:bg-accent hover:text-accent-foreground"
                >
                  ${quickAmount}
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="h-12 text-lg"
                min="1"
              />
              <Button
                onClick={handleDeposit}
                className="h-12 px-8 bg-accent hover:bg-accent/90"
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Deposit
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
