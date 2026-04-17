import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get spending summary
router.get('/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        ...(startDate && { date: { gte: new Date(startDate as string) } }),
        ...(endDate && { date: { lte: new Date(endDate as string) } }),
      },
    });

    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const categoryBreakdown = expenses.reduce((acc: any, e) => {
      if (!acc[e.category]) {
        acc[e.category] = 0;
      }
      acc[e.category] += Number(e.amount);
      return acc;
    }, {});

    res.json({
      totalSpent,
      expenseCount: expenses.length,
      averageTransaction: expenses.length > 0 ? totalSpent / expenses.length : 0,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Get daily spending
router.get('/daily', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { days = '30' } = req.query;
    const daysBack = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const daily = expenses.reduce((acc: any, e) => {
      const day = new Date(e.date).toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = 0;
      }
      acc[day] += Number(e.amount);
      return acc;
    }, {});

    res.json(
      Object.entries(daily).map(([date, amount]) => ({
        date,
        amount,
      }))
    );
  } catch (error) {
    console.error('Get daily error:', error);
    res.status(500).json({ error: 'Failed to fetch daily data' });
  }
});

// Get category trends
router.get('/categories', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        ...(startDate && { date: { gte: new Date(startDate as string) } }),
        ...(endDate && { date: { lte: new Date(endDate as string) } }),
      },
    });

    const categories = expenses.reduce((acc: any, e) => {
      if (!acc[e.category]) {
        acc[e.category] = {
          amount: 0,
          count: 0,
        };
      }
      acc[e.category].amount += Number(e.amount);
      acc[e.category].count += 1;
      return acc;
    }, {});

    res.json(
      Object.entries(categories)
        .map(([name, data]: any) => ({
          category: name,
          amount: data.amount,
          count: data.count,
          average: data.amount / data.count,
        }))
        .sort((a, b) => b.amount - a.amount)
    );
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get recurring expenses
router.get('/recurring', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        isRecurring: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const recurringTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    res.json({
      recurringExpenses: expenses,
      totalMonthly: recurringTotal,
      count: expenses.length,
    });
  } catch (error) {
    console.error('Get recurring error:', error);
    res.status(500).json({ error: 'Failed to fetch recurring expenses' });
  }
});

// Get comparison data
router.get('/comparison', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentExpenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        date: { gte: currentMonth, lte: monthEnd },
      },
    });

    const previousExpenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: previousMonth,
          lt: currentMonth,
        },
      },
    });

    const currentTotal = currentExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const previousTotal = previousExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const percentageChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    res.json({
      current: {
        total: currentTotal,
        count: currentExpenses.length,
      },
      previous: {
        total: previousTotal,
        count: previousExpenses.length,
      },
      percentageChange: Math.round(percentageChange * 100) / 100,
      trend: currentTotal > previousTotal ? 'up' : 'down',
    });
  } catch (error) {
    console.error('Get comparison error:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

export default router;
