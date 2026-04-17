import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Joi from 'joi';
import axios from 'axios';

const router = Router();

const createExpenseSchema = Joi.object({
  description: Joi.string().required(),
  amount: Joi.number().positive().required(),
  category: Joi.string(),
  date: Joi.date(),
  isRecurring: Joi.boolean(),
  recurringFrequency: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  notes: Joi.string(),
});

// Get all expenses
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { category, startDate, endDate, limit = '50' } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        ...(category && { category: category as string }),
        ...(startDate && {
          date: { gte: new Date(startDate as string) },
        }),
        ...(endDate && {
          date: { lte: new Date(endDate as string) },
        }),
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create expense
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createExpenseSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    // Call ML service for categorization
    let category = value.category;
    if (!category) {
      try {
        const response = await axios.post(
          `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/api/categorize`,
          { description: value.description }
        );
        category = response.data.category;
      } catch (err) {
        console.error('Categorization error:', err);
        category = 'Other';
      }
    }

    const expense = await prisma.expense.create({
      data: {
        userId: req.userId,
        description: value.description,
        amount: parseFloat(value.amount),
        category,
        date: value.date ? new Date(value.date) : new Date(),
        isRecurring: value.isRecurring || false,
        recurringFrequency: value.recurringFrequency,
        tags: value.tags || [],
        notes: value.notes,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'CREATE_EXPENSE',
        resourceType: 'Expense',
        resourceId: expense.id,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const expense = await prisma.expense.findFirst({
      where: { id, userId: req.userId },
    });

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.amount && { amount: parseFloat(req.body.amount) }),
        ...(req.body.category && { category: req.body.category }),
        ...(req.body.date && { date: new Date(req.body.date) }),
        ...(req.body.notes && { notes: req.body.notes }),
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'UPDATE_EXPENSE',
        resourceType: 'Expense',
        resourceId: id,
        changes: req.body,
      },
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findFirst({
      where: { id, userId: req.userId },
    });

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    await prisma.expense.delete({ where: { id } });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'DELETE_EXPENSE',
        resourceType: 'Expense',
        resourceId: id,
      },
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Get expenses by category
router.get('/category/:category', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.params;

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        category,
      },
      orderBy: { date: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get category expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

export default router;
