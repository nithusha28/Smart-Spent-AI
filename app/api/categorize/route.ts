import { NextRequest, NextResponse } from 'next/server';
import { categorizeExpenseAdvanced } from '@/lib/ai/categorizer';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required and must be a string' },
        { status: 400 }
      );
    }

    const result = categorizeExpenseAdvanced(description);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Categorization error:', error);
    return NextResponse.json(
      { error: 'Failed to categorize expense' },
      { status: 500 }
    );
  }
}
