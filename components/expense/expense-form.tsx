'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Expense, ExpenseCategory } from '@/lib/types';
import { categorizeExpense } from '@/lib/ai/categorizer';

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Education',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Health',
  'Other',
];

interface ExpenseFormProps {
  onAddExpense?: (expense: Expense) => void;
}

export function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [suggestedCategory, setSuggestedCategory] = useState<ExpenseCategory | null>(null);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);

    if (autoDetect && value.length > 2) {
      const detected = categorizeExpense(value);
      setSuggestedCategory(detected);
      if (detected !== 'Other') {
        setCategory(detected);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !description) {
      alert('Please fill in all fields');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date),
      isRecurring,
      autoDetected: autoDetect && suggestedCategory === category,
    };

    onAddExpense?.(expense);

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('Other');
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setSuggestedCategory(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              type="text"
              placeholder="What did you spend on?"
              value={description}
              onChange={handleDescriptionChange}
            />
            {suggestedCategory && autoDetect && (
              <p className="text-xs text-muted-foreground mt-1">
                AI suggests: <span className="font-semibold">{suggestedCategory}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-muted"
              />
              <span className="text-sm">Recurring Expense</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
                className="w-4 h-4 rounded border-muted"
              />
              <span className="text-sm">AI Auto-Detect</span>
            </label>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
