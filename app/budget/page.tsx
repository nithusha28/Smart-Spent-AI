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
import { mockBudgets } from '@/lib/mock-data';
import { Budget, ExpenseCategory } from '@/lib/types';
import { ArrowLeft, Edit2, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ProtectedRoute } from '@/components/layout/protected-route';

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

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: 'Food' as ExpenseCategory,
    limit: 300,
    period: 'monthly' as 'daily' | 'weekly' | 'monthly',
  });

  const handleAddBudget = () => {
    if (editingId) {
      setBudgets(
        budgets.map((b) =>
          b.id === editingId
            ? { ...b, ...formData, currentSpent: b.currentSpent }
            : b
        )
      );
      setEditingId(null);
    } else {
      const newBudget: Budget = {
        id: Date.now().toString(),
        ...formData,
        currentSpent: 0,
      };
      setBudgets([...budgets, newBudget]);
    }
    setShowForm(false);
    setFormData({ category: 'Food', limit: 300, period: 'monthly' });
  };

  const handleEdit = (budget: Budget) => {
    setFormData({
      category: budget.category,
      limit: budget.limit,
      period: budget.period,
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.currentSpent, 0);
  const totalAdherence = Math.round((totalSpent / totalLimit) * 100);

  const getBudgetStatus = (spent: number, limit: number): string => {
    const ratio = spent / limit;
    if (ratio <= 0.7) return 'On Track';
    if (ratio <= 0.9) return 'Caution';
    if (ratio < 1) return 'Near Limit';
    return 'Over Budget';
  };

  const getBudgetColor = (spent: number, limit: number): string => {
    const ratio = spent / limit;
    if (ratio <= 0.7) return 'bg-green-100 dark:bg-green-950';
    if (ratio <= 0.9) return 'bg-yellow-100 dark:bg-yellow-950';
    if (ratio < 1) return 'bg-orange-100 dark:bg-orange-950';
    return 'bg-red-100 dark:bg-red-950';
  };

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
              <h1 className="text-3xl font-bold">Budget Management</h1>
              <p className="text-muted-foreground text-sm">Set and track budgets by category</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm mb-1">Total Budget</p>
              <p className="text-3xl font-bold">${totalLimit.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm mb-1">Total Spent</p>
              <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm mb-1">Overall Adherence</p>
              <p className={`text-3xl font-bold ${totalAdherence > 100 ? 'text-red-600' : 'text-green-600'}`}>
                {totalAdherence}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Budget Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="mb-6" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Budget
          </Button>
        )}

        {/* Add/Edit Budget Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Budget' : 'Add New Budget'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value as ExpenseCategory })
                    }
                  >
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
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Limit</label>
                  <Input
                    type="number"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Period</label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) =>
                      setFormData({ ...formData, period: value as 'daily' | 'weekly' | 'monthly' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddBudget} className="flex-1">
                  {editingId ? 'Update Budget' : 'Add Budget'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ category: 'Food', limit: 300, period: 'monthly' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budgets List */}
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                <p>No budgets created yet. Add your first budget to get started!</p>
              </CardContent>
            </Card>
          ) : (
            budgets.map((budget) => {
              const percentage = (budget.currentSpent / budget.limit) * 100;
              const status = getBudgetStatus(budget.currentSpent, budget.limit);
              return (
                <Card key={budget.id} className={getBudgetColor(budget.currentSpent, budget.limit)}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{budget.category}</h3>
                          <p className="text-sm text-muted-foreground">
                            {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${budget.currentSpent.toFixed(2)} / ${budget.limit.toFixed(2)}
                          </p>
                          <p className="text-sm font-semibold">{status}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              percentage <= 70
                                ? 'bg-green-600'
                                : percentage <= 90
                                  ? 'bg-yellow-600'
                                  : percentage < 100
                                    ? 'bg-orange-600'
                                    : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        {percentage > 100 && (
                          <p className="text-xs text-red-600 mt-1 font-semibold">
                            Over budget by ${(budget.currentSpent - budget.limit).toFixed(2)}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(budget)}
                          className="flex-1"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
}
