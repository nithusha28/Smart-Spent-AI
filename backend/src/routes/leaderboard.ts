import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get global leaderboard
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '50' } = req.query;

    const leaderboard = await prisma.leaderboard.findMany({
      orderBy: { score: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        userId: true,
        username: true,
        score: true,
        streakCount: true,
        totalTransactions: true,
      },
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user ranking
router.get('/user/rank', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.leaderboard.findUnique({
      where: { userId: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not on leaderboard' });
      return;
    }

    const rank = await prisma.leaderboard.count({
      where: {
        score: {
          gt: Number(user.score),
        },
      },
    });

    res.json({
      ...user,
      rank: rank + 1,
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
});

// Update leaderboard score
router.post('/update', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { points } = req.body;

    if (!points || points <= 0) {
      res.status(400).json({ error: 'Points must be positive' });
      return;
    }

    const entry = await prisma.leaderboard.findUnique({
      where: { userId: req.userId },
    });

    if (!entry) {
      res.status(404).json({ error: 'User not on leaderboard' });
      return;
    }

    const updated = await prisma.leaderboard.update({
      where: { userId: req.userId },
      data: {
        score: entry.score + parseFloat(points),
        totalTransactions: entry.totalTransactions + 1,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update leaderboard error:', error);
    res.status(500).json({ error: 'Failed to update leaderboard' });
  }
});

// Update streak
router.post('/streak', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { increment = true } = req.body;

    const entry = await prisma.leaderboard.findUnique({
      where: { userId: req.userId },
    });

    if (!entry) {
      res.status(404).json({ error: 'User not on leaderboard' });
      return;
    }

    const updated = await prisma.leaderboard.update({
      where: { userId: req.userId },
      data: {
        streakCount: increment ? entry.streakCount + 1 : 0,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
});

export default router;
