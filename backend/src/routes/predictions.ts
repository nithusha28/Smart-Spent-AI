import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import axios from 'axios';

const router = Router();

// Get predictions
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;

    const predictions = await prisma.prediction.findMany({
      where: {
        userId: req.userId,
        ...(category && { category: category as string }),
      },
      orderBy: { predictionDate: 'desc' },
    });

    res.json(predictions);
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Generate predictions
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Call ML service
    const response = await axios.post(
      `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/api/predict`,
      { userId: req.userId }
    );

    const predictions = response.data.predictions;

    // Save to database
    for (const pred of predictions) {
      await prisma.prediction.create({
        data: {
          userId: req.userId,
          category: pred.category,
          predictedAmount: parseFloat(pred.amount),
          predictionDate: new Date(pred.date),
          confidenceScore: parseFloat(pred.confidence),
        },
      });
    }

    res.json(predictions);
  } catch (error) {
    console.error('Generate predictions error:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

export default router;
