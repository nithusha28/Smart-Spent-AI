import { Insight, Expense, Budget } from '../types';
import {
  analyzeSpendingPatterns,
  detectImpulseBuying,
  identifyRecurringExpenses,
} from '../calculations';

export function generateInsights(expenses: Expense[], budgets: Budget[]): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();

  // Pattern Analysis Insight
  const patterns = analyzeSpendingPatterns(expenses);
  insights.push({
    id: 'insight-pattern',
    type: 'pattern',
    title: patterns.pattern,
    description: `You spend ${patterns.weekend.average > patterns.weekday.average ? 'more' : 'less'} on weekends. Weekend avg: $${patterns.weekend.average.toFixed(2)}, Weekday avg: $${patterns.weekday.average.toFixed(2)}`,
    actionable: true,
    icon: '📊',
    createdAt: now,
  });

  // Impulse Buying Detection
  const impulseBuys = detectImpulseBuying(expenses);
  if (impulseBuys.length > 0) {
    insights.push({
      id: 'insight-impulse',
      type: 'warning',
      title: '⚠️ Impulse Buying Detected',
      description: `You made ${impulseBuys.length} non-recurring purchase(s) over $70. Total: $${impulseBuys.reduce((a, b) => a + b.amount, 0).toFixed(2)}`,
      actionable: true,
      icon: '🛍️',
      createdAt: now,
    });
  }

  // Recurring Expenses
  const recurring = identifyRecurringExpenses(expenses);
  if (recurring.length > 0) {
    const totalRecurring = recurring.reduce((sum, r) => sum + r.averageAmount, 0);
    insights.push({
      id: 'insight-recurring',
      type: 'suggestion',
      title: '🔄 Recurring Expenses Found',
      description: `You have ${recurring.length} recurring expenses totaling ~$${totalRecurring.toFixed(2)}/month. Review them to cut costs.`,
      actionable: true,
      icon: '🔄',
      createdAt: now,
    });
  }

  // Budget Overspend Alert
  const overBudgetCategories = budgets.filter((b) => b.currentSpent > b.limit);
  if (overBudgetCategories.length > 0) {
    overBudgetCategories.forEach((budget) => {
      const overage = budget.currentSpent - budget.limit;
      insights.push({
        id: `insight-overbudget-${budget.category}`,
        type: 'alert',
        title: `Over Budget: ${budget.category}`,
        description: `You've exceeded the ${budget.category} budget by $${overage.toFixed(2)}. Time to cut back!`,
        actionable: true,
        icon: '🚨',
        createdAt: now,
      });
    });
  }

  // High Spender Alert
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyAverage = totalSpent / (expenses.length || 1);
  if (dailyAverage > 50) {
    insights.push({
      id: 'insight-high-spender',
      type: 'warning',
      title: '💸 High Daily Spending Detected',
      description: `Your daily average is $${dailyAverage.toFixed(2)}. Consider setting a daily limit.`,
      actionable: true,
      icon: '💸',
      createdAt: now,
    });
  }

  // Savings Opportunity
  const topCategory = [...new Set(expenses.map((e) => e.category))]
    .map((cat) => ({
      category: cat,
      total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
    }))
    .sort((a, b) => b.total - a.total)[0];

  if (topCategory) {
    insights.push({
      id: 'insight-savings',
      type: 'suggestion',
      title: '💡 Savings Opportunity',
      description: `Your biggest spending is on ${topCategory.category} ($${topCategory.total.toFixed(2)}). Try cutting it by 10%.`,
      actionable: true,
      icon: '💡',
      createdAt: now,
    });
  }

  return insights;
}

export function getPersonalizedRecommendations(
  expenses: Expense[],
  budgets: Budget[]
): string[] {
  const recommendations: string[] = [];

  // Check for missing budgets
  const expenseCategories = new Set(expenses.map((e) => e.category));
  const budgetCategories = new Set(budgets.map((b) => b.category));

  expenseCategories.forEach((category) => {
    if (!budgetCategories.has(category)) {
      recommendations.push(`Create a budget for ${category} category`);
    }
  });

  // Check spending ratio
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  if (totalSpent > 3000) {
    recommendations.push('Set a daily spending limit to track expenses better');
  }

  // Check recurring expenses
  const recurring = identifyRecurringExpenses(expenses);
  if (recurring.length > 5) {
    recommendations.push('Review your recurring expenses - some might be worth canceling');
  }

  if (recommendations.length === 0) {
    recommendations.push('Great job managing your finances! Keep it up.');
  }

  return recommendations;
}
