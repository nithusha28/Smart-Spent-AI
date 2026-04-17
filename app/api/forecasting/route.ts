import { NextRequest, NextResponse } from 'next/server';
import {
  calculateTotalSpent,
  calculateDailySpendings,
  predictMonthEndBalance,
  generateSpendingTrend,
} from '@/lib/calculations';
import { Expense } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { expenses, currentBalance } = await request.json();

    if (!Array.isArray(expenses) || typeof currentBalance !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input: expenses must be an array and currentBalance must be a number' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects if needed
    const processedExpenses = expenses.map((e: any) => ({
      ...e,
      date: typeof e.date === 'string' ? new Date(e.date) : e.date,
    })) as Expense[];

    const dailySpendings = calculateDailySpendings(processedExpenses);
    const totalSpent = calculateTotalSpent(processedExpenses);
    const trend = generateSpendingTrend(processedExpenses);

    const today = new Date();
    const daysElapsed = today.getDate();
    const dailyAverage = totalSpent / (processedExpenses.length || 1);

    const projectedBalance = predictMonthEndBalance(currentBalance, daysElapsed, dailyAverage);

    return NextResponse.json(
      {
        totalSpent,
        dailyAverage,
        daysElapsed,
        dailySpendings,
        trend,
        projectedBalance,
        projectedStatus:
          projectedBalance > 0
            ? 'On Track'
            : projectedBalance < -100
              ? 'Critical'
              : 'Warning',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forecasting error:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}
