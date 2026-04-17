import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Joi from 'joi';

const router = Router();

const budgetSchema = Joi.object({
  category: Joi.string().required(),
  limitAmount: Joi.number().positive().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  alertThreshold: Joi.number().min(0).max(1),
});

// Get all budgets
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Create budget
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = budgetSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const budget = await prisma.budget.create({
      data: {
        userId: req.userId,
        category: value.category,
        limitAmount: parseFloat(value.limitAmount),
        startDate: new Date(value.startDate),
        endDate: new Date(value.endDate),
        alertThreshold: value.alertThreshold || 0.8,
      },
    });

    res.status(201).json(budget);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Budget for this category already exists' });
    } else {
      console.error('Create budget error:', error);
      res.status(500).json({ error: 'Failed to create budget' });
    }
  }
});

// Update budget
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const budget = await prisma.budget.findFirst({
      where: { id, userId: req.userId },
    });

    if (!budget) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        ...(req.body.limitAmount && { limitAmount: parseFloat(req.body.limitAmount) }),
        ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
        ...(req.body.endDate && { endDate: new Date(req.body.endDate) }),
        ...(req.body.alertThreshold && { alertThreshold: parseFloat(req.body.alertThreshold) }),
      },
    });

    res.json(updatedBudget);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete budget
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const budget = await prisma.budget.findFirst({
      where: { id, userId: req.userId },
    });

    if (!budget) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    await prisma.budget.delete({ where: { id } });

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

// Get budget with spending
router.get('/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const budget = await prisma.budget.findFirst({
      where: { id, userId: req.userId },
    });

    if (!budget) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    const spent = await prisma.expense.aggregate({
      where: {
        userId: req.userId,
        category: budget.category,
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
      },
      _sum: { amount: true },
    });

    const totalSpent = spent._sum.amount || 0;
    const remaining = Number(budget.limitAmount) - Number(totalSpent);
    const percentage = (Number(totalSpent) / Number(budget.limitAmount)) * 100;

    res.json({
      budget,
      spent: totalSpent,
      remaining: Math.max(0, remaining),
      percentage: Math.min(100, Math.round(percentage)),
      isOverBudget: remaining < 0,
      alertStatus: percentage >= 80 ? 'warning' : percentage >= 100 ? 'danger' : 'safe',
    });
  } catch (error) {
    console.error('Get budget status error:', error);
    res.status(500).json({ error: 'Failed to fetch budget status' });
  }
});

export default router;
