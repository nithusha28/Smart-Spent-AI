import { NextRequest, NextResponse } from 'next/server';
import { generateInsights, getPersonalizedRecommendations } from '@/lib/ai/insights';
import { Expense, Budget } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { expenses, budgets } = await request.json();

    if (!Array.isArray(expenses) || !Array.isArray(budgets)) {
      return NextResponse.json(
        { error: 'Expenses and budgets must be arrays' },
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

    const insights = generateInsights(processedExpenses, processedBudgets);
    const recommendations = getPersonalizedRecommendations(
      processedExpenses,
      processedBudgets
    );

    return NextResponse.json(
      { insights, recommendations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Insights generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
