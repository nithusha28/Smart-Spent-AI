'use client';

import { useState, useMemo } from 'react';
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
import { ExpenseForm } from '@/components/expense/expense-form';
import { mockExpenses } from '@/lib/mock-data';
import { Expense, ExpenseCategory } from '@/lib/types';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { formatInr } from '@/lib/currency';

const CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Education',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Health',
  'Other',
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showForm, setShowForm] = useState(false);

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((e) =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'amount-high') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-low') {
      filtered.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === 'date-new') {
      filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    } else {
      filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    return filtered;
  }, [expenses, selectedCategory, searchTerm, sortBy]);

  const handleAddExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
    setShowForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background lg:pl-64">
      <SidebarNav />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Expenses</h1>
              <p className="text-muted-foreground text-sm">Manage and track all your expenses</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date (Old)</SelectItem>
              <SelectItem value="date-new">Date (New)</SelectItem>
              <SelectItem value="amount-high">Amount (High)</SelectItem>
              <SelectItem value="amount-low">Amount (Low)</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowForm(!showForm)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Add Expense Form */}
        {showForm && (
          <div className="mb-6">
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>
        )}

        {/* Summary */}
        <Card className="mb-6 bg-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Filtered Results</p>
                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                </p>
              </div>
              {filteredExpenses.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Avg: ${(totalSpent / filteredExpenses.length).toFixed(2)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense List */}
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No expenses found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-lg">
                          {expense.category === 'Food'
                            ? '🍔'
                            : expense.category === 'Transport'
                              ? '🚗'
                              : expense.category === 'Education'
                                ? '📚'
                                : expense.category === 'Entertainment'
                                  ? '🎬'
                                  : expense.category === 'Utilities'
                                    ? '💡'
                                    : expense.category === 'Shopping'
                                      ? '🛍️'
                                      : expense.category === 'Health'
                                        ? '🏥'
                                        : '📌'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {expense.category} •{' '}
                            {expense.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                            {expense.isRecurring && ' • Recurring'}
                            {expense.autoDetected && ' • AI Detected'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      </div>
    </ProtectedRoute>
  );
}
