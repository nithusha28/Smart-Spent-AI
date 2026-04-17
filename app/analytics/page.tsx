'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { mockExpenses, mockBudgets } from '@/lib/mock-data';
import {
  calculateDailySpendings,
  generateSpendingTrend,
  analyzeSpendingPatterns,
  calculateSpentByCategory,
} from '@/lib/calculations';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const dailySpendings = useMemo(() => calculateDailySpendings(mockExpenses), []);
  const trend = useMemo(() => generateSpendingTrend(mockExpenses), []);
  const patterns = useMemo(() => analyzeSpendingPatterns(mockExpenses), []);
  const categoryData = useMemo(() => calculateSpentByCategory(mockExpenses), []);

  // Prepare category chart data
  const categoryChartData = categoryData.map((cat) => ({
    name: cat.category,
    amount: cat.amount,
  }));

  // Prepare budget vs actual data
  const budgetData = mockBudgets.map((budget) => ({
    category: budget.category,
    budget: budget.limit,
    actual: budget.currentSpent,
  }));

  // Prepare trend data for monthly comparison
  const trendData = trend.map((t) => ({
    month: t.period,
    total: t.total,
    change: t.comparison,
  }));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background lg:pl-64">
        <SidebarNav />

        {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Analytics & Reports</h1>
                <p className="text-muted-foreground text-sm">
                  Detailed insights into your spending patterns
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Daily Spending Trend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailySpendings}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown & Budget Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Budget vs Actual */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="budget" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Spending Trend Over Months */}
        {trendData.length > 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Spending Pattern Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Weekday vs Weekend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">Weekday Spending</h3>
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  ${patterns.weekday.average.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg per transaction ({patterns.weekday.count} transactions)
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-2">Weekend Spending</h3>
                <p className="text-3xl font-bold text-orange-600 mb-1">
                  ${patterns.weekend.average.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg per transaction ({patterns.weekend.count} transactions)
                </p>
              </div>
              <div className="border-t pt-4 bg-blue-50 dark:bg-blue-950 rounded p-3">
                <p className="text-sm font-semibold">{patterns.pattern}</p>
              </div>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryData.slice(0, 5).map((cat, idx) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {idx + 1}. {cat.category}
                      </span>
                      <span className="font-bold">${cat.amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.percentage}% of total</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-muted-foreground text-sm mb-1">Total Transactions</p>
                <p className="text-2xl font-bold">{mockExpenses.length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-muted-foreground text-sm mb-1">Avg Transaction</p>
                <p className="text-2xl font-bold">
                  ${(mockExpenses.reduce((s, e) => s + e.amount, 0) / mockExpenses.length).toFixed(2)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-muted-foreground text-sm mb-1">Largest Expense</p>
                <p className="text-2xl font-bold">
                  ${Math.max(...mockExpenses.map((e) => e.amount)).toFixed(2)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-muted-foreground text-sm mb-1">Recurring Expenses</p>
                <p className="text-2xl font-bold">{mockExpenses.filter((e) => e.isRecurring).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      </div>
    </ProtectedRoute>
  );
}
