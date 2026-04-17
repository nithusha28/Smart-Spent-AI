import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Joi from 'joi';

const router = Router();

const goalSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  targetAmount: Joi.number().positive().required(),
  targetDate: Joi.date().required(),
  icon: Joi.string(),
  color: Joi.string(),
});

// Get all goals
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.userId },
      orderBy: { targetDate: 'asc' },
    });

    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Create goal
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = goalSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: req.userId,
        title: value.title,
        description: value.description,
        targetAmount: parseFloat(value.targetAmount),
        targetDate: new Date(value.targetDate),
        icon: value.icon,
        color: value.color,
      },
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update goal
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const updatedGoal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(req.body.title && { title: req.body.title }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.targetAmount && { targetAmount: parseFloat(req.body.targetAmount) }),
        ...(req.body.currentAmount && { currentAmount: parseFloat(req.body.currentAmount) }),
        ...(req.body.targetDate && { targetDate: new Date(req.body.targetDate) }),
        ...(req.body.icon && { icon: req.body.icon }),
        ...(req.body.color && { color: req.body.color }),
      },
    });

    res.json(updatedGoal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Add to goal (increase current amount)
router.post('/:id/add', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Amount must be positive' });
      return;
    }

    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const updatedGoal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: goal.currentAmount + parseFloat(amount),
      },
    });

    res.json(updatedGoal);
  } catch (error) {
    console.error('Add to goal error:', error);
    res.status(500).json({ error: 'Failed to add to goal' });
  }
});

// Delete goal
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await prisma.savingsGoal.delete({ where: { id } });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Get goal progress
router.get('/:id/progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const now = new Date();
    const daysRemaining = Math.ceil(
      (goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const percentage = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;

    res.json({
      goal,
      percentage: Math.min(100, Math.round(percentage)),
      daysRemaining: Math.max(0, daysRemaining),
      remaining: Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount)),
      isCompleted: goal.currentAmount >= goal.targetAmount,
    });
  } catch (error) {
    console.error('Get goal progress error:', error);
    res.status(500).json({ error: 'Failed to fetch goal progress' });
  }
});

export default router;
