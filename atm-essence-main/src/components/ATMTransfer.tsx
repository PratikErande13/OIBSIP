import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types/atm';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ATMTransferProps {
  user: User;
  balance: number;
  onTransfer: (amount: number, recipient: string) => void;
  onBack: () => void;
}

export const ATMTransfer = ({ balance, onTransfer, onBack }: ATMTransferProps) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleTransfer = () => {
    const transferAmount = parseFloat(amount);
    
    if (!recipient.trim()) {
      toast.error('Please enter recipient account');
      return;
    }
    
    if (transferAmount <= 0 || isNaN(transferAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (transferAmount > balance) {
      toast.error('Insufficient funds');
      return;
    }
    
    onTransfer(transferAmount, recipient);
    setAmount('');
    setRecipient('');
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
              <Send className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Transfer Money</h2>
            <p className="text-muted-foreground">Available Balance: ${balance.toFixed(2)}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Account Number</Label>
              <Input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter account number"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Transfer Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="h-12 text-lg"
                min="1"
                max={balance}
              />
            </div>

            <Button
              onClick={handleTransfer}
              className="w-full h-12 text-lg"
              disabled={!amount || !recipient || parseFloat(amount) <= 0}
            >
              <Send className="w-5 h-5 mr-2" />
              Transfer
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Note: Transfers are instant and will be reflected immediately in your account balance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
