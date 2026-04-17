export type ExpenseCategory = 'Food' | 'Transport' | 'Education' | 'Entertainment' | 'Utilities' | 'Shopping' | 'Health' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  isRecurring: boolean;
  autoDetected: boolean;
  userId?: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  limit: number;
  currentSpent: number;
  period: 'daily' | 'weekly' | 'monthly';
  userId?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category?: string;
  userId?: string;
}

export interface FinancialHealth {
  score: number; // 0-100
  savingsRate: number;
  budgetAdherence: number;
  expenseDiscipline: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: Date;
}

export interface Insight {
  id: string;
  type: 'pattern' | 'alert' | 'suggestion' | 'warning' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
  icon?: string;
  createdAt: Date;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface SpendingTrend {
  period: string;
  total: number;
  comparison: number; // percentage change
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}
