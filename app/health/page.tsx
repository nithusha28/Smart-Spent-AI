'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HealthScoreCard } from '@/components/gamification/health-score-card';
import { AchievementBadges } from '@/components/gamification/achievement-badges';
import {
  mockExpenses,
  mockBudgets,
  mockAchievements,
} from '@/lib/mock-data';
import {
  calculateFinancialHealthScore,
  analyzeSpendingPatterns,
  identifyRecurringExpenses,
  detectImpulseBuying,
} from '@/lib/calculations';
import { ArrowLeft, BarChart3, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ProtectedRoute } from '@/components/layout/protected-route';

const MONTHLY_INCOME = 150000; // INR

export default function HealthPage() {
  const health = calculateFinancialHealthScore(MONTHLY_INCOME, mockExpenses, mockBudgets);
  const patterns = analyzeSpendingPatterns(mockExpenses);
  const recurring = identifyRecurringExpenses(mockExpenses);
  const impulses = detectImpulseBuying(mockExpenses);

  const unlockedAchievements = mockAchievements.filter((a) => a.unlockedAt);
  const lockedAchievements = mockAchievements.filter((a) => !a.unlockedAt);

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
              <h1 className="text-3xl font-bold">Financial Health</h1>
              <p className="text-muted-foreground text-sm">Your overall financial wellness dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Health Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Health Score Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Savings Rate</p>
                    <p className="text-3xl font-bold text-green-600">{health.savingsRate}%</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      You're saving {health.savingsRate}% of your income
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Budget Adherence</p>
                    <p className="text-3xl font-bold text-blue-600">{health.budgetAdherence}%</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {health.budgetAdherence > 80 ? 'Excellent' : 'Good'} budget control
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Expense Discipline</p>
                    <p className="text-3xl font-bold text-purple-600">{health.expenseDiscipline}%</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Very {health.expenseDiscipline > 70 ? 'disciplined' : 'diligent'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <HealthScoreCard health={health} />
        </div>

        {/* Spending Patterns */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Spending Patterns Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Weekday Spending</h3>
                <p className="text-3xl font-bold mb-2">${patterns.weekday.average.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Avg per transaction: {patterns.weekday.count} transactions
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Weekend Spending</h3>
                <p className="text-3xl font-bold mb-2">${patterns.weekend.average.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Avg per transaction: {patterns.weekend.count} transactions
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold mb-1">Pattern Insight</p>
              <p className="text-sm">{patterns.pattern}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Expenses */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recurring Expenses ({recurring.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {recurring.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recurring expenses identified</p>
            ) : (
              <div className="space-y-3">
                {recurring.map((exp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{exp.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {exp.category} • {exp.frequency}x occurrences
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${exp.averageAmount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        ~${exp.totalAmount.toFixed(2)}/month
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Impulse Buying Alerts */}
        {impulses.length > 0 && (
          <Card className="mb-8 border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <CardTitle>Impulse Buying Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {impulses.map((exp) => (
                  <div key={exp.id} className="p-3 border rounded-lg bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{exp.description}</p>
                        <p className="text-xs text-muted-foreground">{exp.category}</p>
                      </div>
                      <p className="text-lg font-bold text-red-600">${exp.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-sm">
                <p className="font-semibold mb-1">💡 Tip</p>
                <p>Try the 24-hour rule for large purchases: wait a day before buying to confirm it's not an impulse.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <AchievementBadges achievements={mockAchievements} />
      </main>
      </div>
    </ProtectedRoute>
  );
}
