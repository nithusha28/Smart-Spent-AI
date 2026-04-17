import { Expense, Budget, FinancialHealth, CategoryBreakdown, DailySpending, SpendingTrend } from './types';

export const calculateTotalSpent = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const calculateSpentByCategory = (expenses: Expense[]): CategoryBreakdown[] => {
  const categoryMap: { [key: string]: number } = {};

  expenses.forEach((expense) => {
    if (!categoryMap[expense.category]) {
      categoryMap[expense.category] = 0;
    }
    categoryMap[expense.category] += expense.amount;
  });

  const total = calculateTotalSpent(expenses);

  return Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category: category as any,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const calculateDailySpendings = (expenses: Expense[]): DailySpending[] => {
  const dailyMap: { [key: string]: number } = {};

  expenses.forEach((expense) => {
    const dateStr = expense.date.toISOString().split('T')[0];
    dailyMap[dateStr] = (dailyMap[dateStr] || 0) + expense.amount;
  });

  return Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const calculateBudgetAdherence = (budgets: Budget[]): number => {
  if (budgets.length === 0) return 100;

  let totalAdherence = 0;
  budgets.forEach((budget) => {
    const adherence = Math.min((budget.currentSpent / budget.limit) * 100, 100);
    totalAdherence += Math.max(100 - adherence, 0);
  });

  return Math.round(totalAdherence / budgets.length);
};

export const calculateSavingsRate = (income: number, expenses: Expense[]): number => {
  const totalSpent = calculateTotalSpent(expenses);
  return income > 0 ? Math.round(((income - totalSpent) / income) * 100) : 0;
};

export const calculateExpenseDiscipline = (budgets: Budget[]): number => {
  if (budgets.length === 0) return 100;

  let totalScore = 0;
  budgets.forEach((budget) => {
    const ratio = budget.currentSpent / budget.limit;
    let score = 0;

    if (ratio <= 0.7) {
      score = 100;
    } else if (ratio <= 0.85) {
      score = 85;
    } else if (ratio <= 1.0) {
      score = 60;
    } else if (ratio <= 1.2) {
      score = 30;
    } else {
      score = 10;
    }

    totalScore += score;
  });

  return Math.round(totalScore / budgets.length);
};

export const calculateFinancialHealthScore = (
  income: number,
  expenses: Expense[],
  budgets: Budget[]
): FinancialHealth => {
  const savingsRate = calculateSavingsRate(income, expenses);
  const budgetAdherence = calculateBudgetAdherence(budgets);
  const expenseDiscipline = calculateExpenseDiscipline(budgets);

  // Weighted score calculation
  const score = Math.round(
    savingsRate * 0.4 + budgetAdherence * 0.3 + expenseDiscipline * 0.3
  );

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (score < 50) {
    riskLevel = 'High';
  } else if (score < 70) {
    riskLevel = 'Medium';
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    savingsRate,
    budgetAdherence,
    expenseDiscipline,
    riskLevel,
    lastUpdated: new Date(),
  };
};

export const predictMonthEndBalance = (
  currentBalance: number,
  daysElapsed: number,
  dailyAverageSpend: number
): number => {
  const daysInMonth = 30;
  const remainingDays = daysInMonth - daysElapsed;
  const projectedSpend = dailyAverageSpend * remainingDays;
  return currentBalance - projectedSpend;
};

export const identifyRecurringExpenses = (expenses: Expense[]) => {
  const recurring: { [key: string]: Expense[] } = {};

  expenses.forEach((expense) => {
    const key = `${expense.category}-${expense.description}`;
    if (!recurring[key]) {
      recurring[key] = [];
    }
    recurring[key].push(expense);
  });

  return Object.entries(recurring)
    .filter(([_, exps]) => exps.length >= 2)
    .map(([key, exps]) => ({
      description: key.split('-')[1],
      category: key.split('-')[0],
      frequency: exps.length,
      averageAmount: exps.reduce((a, b) => a + b.amount, 0) / exps.length,
      totalAmount: exps.reduce((a, b) => a + b.amount, 0),
    }));
};

export const detectImpulseBuying = (expenses: Expense[]): Expense[] => {
  // Impulse buying: Shopping category with amount > $70 or unusual spike
  return expenses.filter((expense) => {
    if (expense.category === 'Entertainment' || expense.category === 'Shopping') {
      return expense.amount > 70 && !expense.isRecurring;
    }
    return false;
  });
};

export const analyzeSpendingPatterns = (expenses: Expense[]) => {
  const weekdayExpenses = expenses.filter(
    (e) => e.date.getDay() !== 0 && e.date.getDay() !== 6
  );
  const weekendExpenses = expenses.filter(
    (e) => e.date.getDay() === 0 || e.date.getDay() === 6
  );

  const weekdayTotal = calculateTotalSpent(weekdayExpenses);
  const weekendTotal = calculateTotalSpent(weekendExpenses);

  return {
    weekday: {
      count: weekdayExpenses.length,
      total: weekdayTotal,
      average: weekdayExpenses.length > 0 ? weekdayTotal / weekdayExpenses.length : 0,
    },
    weekend: {
      count: weekendExpenses.length,
      total: weekendTotal,
      average: weekendExpenses.length > 0 ? weekendTotal / weekendExpenses.length : 0,
    },
    pattern: weekendTotal > weekdayTotal ? 'Higher weekend spending' : 'Higher weekday spending',
  };
};

export const generateSpendingTrend = (expenses: Expense[]): SpendingTrend[] => {
  const trends: SpendingTrend[] = [];
  const monthlyTotals: { [key: string]: number } = {};

  expenses.forEach((expense) => {
    const monthKey = `${expense.date.getFullYear()}-${String(
      expense.date.getMonth() + 1
    ).padStart(2, '0')}`;
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
  });

  const months = Object.keys(monthlyTotals).sort();

  for (let i = 0; i < months.length; i++) {
    const current = monthlyTotals[months[i]];
    const previous = i > 0 ? monthlyTotals[months[i - 1]] : current;
    const comparison = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

    trends.push({
      period: months[i],
      total: current,
      comparison,
    });
  }

  return trends;
};
