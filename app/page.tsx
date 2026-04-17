'use client';

import { useState, useMemo } from 'react';
import { OverviewCard } from '@/components/dashboard/overview-card';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { CategoryBreakdownChart } from '@/components/dashboard/category-breakdown';
import { InsightCard } from '@/components/dashboard/insight-card';
import { HealthScoreCard } from '@/components/gamification/health-score-card';
import { AchievementBadges } from '@/components/gamification/achievement-badges';
import { ExpenseForm } from '@/components/expense/expense-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ExpenseList } from '@/components/expense/expense-list';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { formatInr } from '@/lib/currency';
import {
  mockExpenses,
  mockBudgets,
  mockGoals,
  mockAchievements,
} from '@/lib/mock-data';
import {
  calculateTotalSpent,
  calculateSpentByCategory,
  calculateDailySpendings,
  calculateFinancialHealthScore,
  calculateBudgetAdherence,
  calculateSavingsRate,
} from '@/lib/calculations';
import { generateInsights } from '@/lib/ai/insights';
import { Expense } from '@/lib/types';
import { TrendingDown, Plus, Settings } from 'lucide-react';

const MONTHLY_INCOME = 150000; // INR

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  // Calculate all metrics
  const totalSpent = useMemo(() => calculateTotalSpent(expenses), [expenses]);
  const categoryBreakdown = useMemo(() => calculateSpentByCategory(expenses), [expenses]);
  const dailySpendings = useMemo(() => calculateDailySpendings(expenses), [expenses]);
  const health = useMemo(
    () => calculateFinancialHealthScore(MONTHLY_INCOME, expenses, mockBudgets),
    [expenses]
  );
  const insights = useMemo(() => generateInsights(expenses, mockBudgets), [expenses]);
  const savingsRate = useMemo(
    () => calculateSavingsRate(MONTHLY_INCOME, expenses),
    [expenses]
  );

  const handleAddExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
    setShowExpenseForm(false);
  };

  const remainingBudget = MONTHLY_INCOME - totalSpent;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background lg:pl-64">
      <SidebarNav />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">SmartSpend AI</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Your intelligent expense tracker & financial companion
              </p>
            </div>
            <Button variant="outline" size="icon" title="Settings">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <OverviewCard
            title="Total Spent"
            value={`$${totalSpent.toFixed(2)}`}
            description={`${expenses.length} expenses tracked`}
            icon="💰"
          />
          <OverviewCard
            title="Remaining Budget"
            value={`$${remainingBudget.toFixed(2)}`}
            description={`of $${MONTHLY_INCOME} monthly`}
            icon="🎯"
            trend={remainingBudget > MONTHLY_INCOME / 2 ? 10 : -5}
          />
          <OverviewCard
            title="Savings Rate"
            value={`${savingsRate}%`}
            description="of monthly income"
            icon="📈"
          />
          <OverviewCard
            title="Budget Adherence"
            value={`${calculateBudgetAdherence(mockBudgets)}%`}
            description="on track"
            icon="✅"
          />
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <SpendingChart data={dailySpendings} />
            <CategoryBreakdownChart data={categoryBreakdown} />
          </div>

          {/* Health Score & Quick Actions */}
          <div className="space-y-6">
            <HealthScoreCard health={health} />

            {!showExpenseForm && (
              <Button
                onClick={() => setShowExpenseForm(true)}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            )}

            {showExpenseForm && (
              <ExpenseForm onAddExpense={handleAddExpense} />
            )}
          </div>
        </div>

        {/* Insights & Achievements */}
        <Tabs defaultValue="insights" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4 mt-4">
            {insights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No insights available yet. Keep tracking your expenses!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <AchievementBadges achievements={mockAchievements} />
          </TabsContent>
        </Tabs>

        {/* Category Details */}
        <section className="bg-card border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Category Breakdown Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold text-sm mb-2">{cat.category}</h3>
                <p className="text-2xl font-bold text-primary mb-1">${cat.amount.toFixed(2)}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{cat.percentage}% of total</span>
                  <span>
                    {expenses.filter((e) => e.category === cat.category).length} items
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Expenses */}
        <section className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Expenses</h2>
            <a href="/expenses" className="text-sm text-primary hover:underline">
              View All →
            </a>
          </div>
          <ExpenseList 
            expenses={[...expenses].sort((a, b) => b.date.getTime() - a.date.getTime())} 
            onDelete={handleDeleteExpense}
            maxItems={5}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>SmartSpend AI • Your AI-powered financial companion for students</p>
      </footer>
      </div>
    </ProtectedRoute>
  );
}
