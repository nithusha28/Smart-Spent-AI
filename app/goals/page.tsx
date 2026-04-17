'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockGoals } from '@/lib/mock-data';
import { SavingsGoal } from '@/lib/types';
import { ArrowLeft, Edit2, Trash2, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ProtectedRoute } from '@/components/layout/protected-route';

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>(mockGoals);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: 1000,
    currentAmount: 0,
    deadline: new Date().toISOString().split('T')[0],
  });

  const handleAddGoal = () => {
    if (editingId) {
      setGoals(
        goals.map((g) =>
          g.id === editingId
            ? {
                ...g,
                title: formData.title,
                targetAmount: formData.targetAmount,
                currentAmount: formData.currentAmount,
                deadline: new Date(formData.deadline),
              }
            : g
        )
      );
      setEditingId(null);
    } else {
      const newGoal: SavingsGoal = {
        id: Date.now().toString(),
        title: formData.title,
        targetAmount: formData.targetAmount,
        currentAmount: formData.currentAmount,
        deadline: new Date(formData.deadline),
      };
      setGoals([...goals, newGoal]);
    }
    setShowForm(false);
    setFormData({
      title: '',
      targetAmount: 1000,
      currentAmount: 0,
      deadline: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (goal: SavingsGoal) => {
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline.toISOString().split('T')[0],
    });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const handleAddSavings = (id: string, amount: number) => {
    setGoals(
      goals.map((g) =>
        g.id === id
          ? {
              ...g,
              currentAmount: Math.min(g.currentAmount + amount, g.targetAmount),
            }
          : g
      )
    );
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  const getDaysRemaining = (deadline: Date): number => {
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getUrgencyColor = (daysRemaining: number): string => {
    if (daysRemaining < 0) return 'text-gray-500';
    if (daysRemaining < 30) return 'text-red-600';
    if (daysRemaining < 90) return 'text-yellow-600';
    return 'text-green-600';
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
              <h1 className="text-3xl font-bold">Savings Goals</h1>
              <p className="text-muted-foreground text-sm">Plan and track your financial goals</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm mb-1">Total Goals</p>
              <p className="text-3xl font-bold">{goals.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedGoals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm mb-1">Total Target</p>
              <p className="text-3xl font-bold">${totalTarget.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm mb-1">Total Saved</p>
              <p className="text-3xl font-bold text-blue-600">${totalSaved.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Goal Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="mb-6" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create New Goal
          </Button>
        )}

        {/* Add/Edit Goal Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Goal' : 'Create New Savings Goal'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Goal Title</label>
                  <Input
                    placeholder="e.g., Summer Trip, Laptop Fund"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Amount ($)</label>
                  <Input
                    type="number"
                    step="100"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Amount ($)</label>
                  <Input
                    type="number"
                    step="100"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddGoal} className="flex-1">
                  {editingId ? 'Update Goal' : 'Create Goal'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      title: '',
                      targetAmount: 1000,
                      currentAmount: 0,
                      deadline: new Date().toISOString().split('T')[0],
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No savings goals yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => {
              const percentage = (goal.currentAmount / goal.targetAmount) * 100;
              const daysRemaining = getDaysRemaining(goal.deadline);
              const isCompleted = goal.currentAmount >= goal.targetAmount;

              return (
                <Card
                  key={goal.id}
                  className={`${isCompleted ? 'bg-green-50 dark:bg-green-950' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{goal.title}</h3>
                          <p className={`text-sm ${getUrgencyColor(daysRemaining)}`}>
                            {isCompleted
                              ? '✓ Goal completed!'
                              : daysRemaining < 0
                                ? 'Deadline passed'
                                : `${daysRemaining} days remaining`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                          </p>
                          <p className="text-sm font-bold text-primary">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              isCompleted
                                ? 'bg-green-600'
                                : daysRemaining < 30
                                  ? 'bg-red-600'
                                  : daysRemaining < 90
                                    ? 'bg-yellow-600'
                                    : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Input
                          type="number"
                          placeholder="Add savings amount"
                          className="flex-1 min-w-[120px]"
                          id={`savings-${goal.id}`}
                          step="10"
                        />
                        <Button
                          onClick={() => {
                            const input = document.getElementById(`savings-${goal.id}`) as HTMLInputElement;
                            const amount = parseFloat(input.value);
                            if (amount > 0) {
                              handleAddSavings(goal.id, amount);
                              input.value = '';
                            }
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Add
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(goal)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(goal.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
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
