import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/atm';
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';

interface ATMHistoryProps {
  transactions: Transaction[];
  onBack: () => void;
}

export const ATMHistory = ({ transactions, onBack }: ATMHistoryProps) => {
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'withdraw':
        return <ArrowDownToLine className="w-5 h-5 text-destructive" />;
      case 'deposit':
        return <ArrowUpFromLine className="w-5 h-5 text-accent" />;
      case 'transfer':
        return <ArrowRightLeft className="w-5 h-5 text-primary" />;
    }
  };

  const getAmountColor = (type: Transaction['type']) => {
    switch (type) {
      case 'withdraw':
      case 'transfer':
        return 'text-destructive';
      case 'deposit':
        return 'text-accent';
    }
  };

  const getAmountPrefix = (type: Transaction['type']) => {
    return type === 'deposit' ? '+' : '-';
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
            <h2 className="text-2xl font-bold text-foreground mb-2">Transaction History</h2>
            <p className="text-muted-foreground">Recent transactions</p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-full">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {transaction.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(transaction.timestamp), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${getAmountColor(transaction.type)}`}>
                        {getAmountPrefix(transaction.type)}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance: ${transaction.balanceAfter.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
