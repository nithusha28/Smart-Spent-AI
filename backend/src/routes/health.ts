import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import axios from 'axios';

const router = Router();

// Calculate health score
const calculateHealthScore = async (userId: string) => {
  try {
    // Get expenses for current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
    });

    const budgets = await prisma.budget.findMany({
      where: { userId },
    });

    // Calculations
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const monthlyBudget = Number(user?.monthlyBudget || 2000);

    const savingsRate = monthlyBudget > 0 ? ((monthlyBudget - totalSpent) / monthlyBudget) * 100 : 0;
    const savingsRateScore = Math.max(0, Math.min(100, savingsRate * 0.5 + 50));

    // Budget adherence
    let budgetAdherenceScore = 100;
    for (const budget of budgets) {
      const spent = expenses
        .filter((e) => e.category === budget.category)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const ratio = spent / Number(budget.limitAmount);
      if (ratio > 1) budgetAdherenceScore -= 20;
      else if (ratio > 0.8) budgetAdherenceScore -= 10;
    }
    budgetAdherenceScore = Math.max(0, budgetAdherenceScore);

    // Discipline score (based on logging consistency)
    const expenseCount = expenses.length;
    const disciplineScore = Math.min(100, expenseCount * 2);

    const overallScore = (savingsRateScore + budgetAdherenceScore + disciplineScore) / 3;

    return {
      overall: Math.round(overallScore),
      savingsRate: Math.round(savingsRateScore),
      budgetAdherence: Math.round(budgetAdherenceScore),
      discipline: Math.round(disciplineScore),
      details: {
        totalSpent,
        monthlyBudget,
        expenseCount,
        savingsPercentage: Math.max(0, monthlyBudget - totalSpent),
      },
    };
  } catch (error) {
    console.error('Calculate health score error:', error);
    return null;
  }
};

// Get current health score
router.get('/score', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const score = await calculateHealthScore(req.userId);

    if (!score) {
      res.status(500).json({ error: 'Failed to calculate health score' });
      return;
    }

    // Save to database
    const now = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1);

    await prisma.healthScore.upsert({
      where: { userId_month: { userId: req.userId, month } },
      update: {
        overallScore: score.overall,
        savingsRateScore: score.savingsRate,
        budgetAdherenceScore: score.budgetAdherence,
        disciplineScore: score.discipline,
        calculationDetails: score.details,
      },
      create: {
        userId: req.userId,
        overallScore: score.overall,
        savingsRateScore: score.savingsRate,
        budgetAdherenceScore: score.budgetAdherence,
        disciplineScore: score.discipline,
        month,
        calculationDetails: score.details,
      },
    });

    res.json(score);
  } catch (error) {
    console.error('Get health score error:', error);
    res.status(500).json({ error: 'Failed to fetch health score' });
  }
});

// Get health history
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const scores = await prisma.healthScore.findMany({
      where: { userId: req.userId },
      orderBy: { month: 'desc' },
      take: 12,
    });

    res.json(scores);
  } catch (error) {
    console.error('Get health history error:', error);
    res.status(500).json({ error: 'Failed to fetch health history' });
  }
});

// Get insights
router.get('/insights', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Call ML service for detailed insights
    const response = await axios.post(
      `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/api/insights`,
      { userId: req.userId }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

export default router;
