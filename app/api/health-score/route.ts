import { NextRequest, NextResponse } from 'next/server';
import { calculateFinancialHealthScore } from '@/lib/calculations';
import { Expense, Budget } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { income, expenses, budgets } = await request.json();

    if (typeof income !== 'number' || !Array.isArray(expenses) || !Array.isArray(budgets)) {
      return NextResponse.json(
        {
          error: 'Invalid input: income must be a number, expenses and budgets must be arrays',
        },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects if needed
    const processedExpenses = expenses.map((e: any) => ({
      ...e,
      date: typeof e.date === 'string' ? new Date(e.date) : e.date,
    })) as Expense[];

    const processedBudgets = budgets.map((b: any) => ({
      ...b,
    })) as Budget[];

    const health = calculateFinancialHealthScore(income, processedExpenses, processedBudgets);

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health score calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate health score' },
      { status: 500 }
    );
  }
}
