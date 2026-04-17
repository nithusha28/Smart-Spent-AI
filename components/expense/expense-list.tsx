'use client';

import { Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete?: (id: string) => void;
  maxItems?: number;
}

const categoryEmojis: { [key: string]: string } = {
  Food: '🍔',
  Transport: '🚗',
  Education: '📚',
  Entertainment: '🎬',
  Utilities: '💡',
  Shopping: '🛍️',
  Health: '🏥',
  Other: '📌',
};

export function ExpenseList({ expenses, onDelete, maxItems = 5 }: ExpenseListProps) {
  const displayExpenses = maxItems ? expenses.slice(0, maxItems) : expenses;

  if (displayExpenses.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>No expenses to display</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {displayExpenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="text-lg">{categoryEmojis[expense.category] || '📌'}</div>
            <div className="flex-1">
              <p className="font-medium text-sm">{expense.description}</p>
              <p className="text-xs text-muted-foreground">
                {expense.category} • {expense.date.toLocaleDateString()}
                {expense.isRecurring && ' • Recurring'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm">${expense.amount.toFixed(2)}</p>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(expense.id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
