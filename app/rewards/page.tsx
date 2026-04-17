'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HealthScoreCard } from '@/components/gamification/health-score-card';
import { AchievementBadges } from '@/components/gamification/achievement-badges';
import { Leaderboard } from '@/components/gamification/leaderboard';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import {
  mockExpenses,
  mockBudgets,
  mockAchievements,
} from '@/lib/mock-data';
import {
  calculateFinancialHealthScore,
} from '@/lib/calculations';
import { ArrowLeft, Flame, Star, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/protected-route';

const MONTHLY_INCOME = 150000; // INR

// Mock leaderboard data
const leaderboardData = [
  { rank: 1, name: 'Alex Chen', score: 920, streak: 28, achievements: 12 },
  { rank: 2, name: 'Jordan Smith', score: 875, streak: 21, achievements: 10 },
  { rank: 3, name: 'Casey Williams', score: 820, streak: 18, achievements: 9 },
  { rank: 4, name: 'You', score: 780, streak: 15, achievements: 8 },
  { rank: 5, name: 'Morgan Davis', score: 750, streak: 14, achievements: 7 },
  { rank: 6, name: 'Taylor Johnson', score: 710, streak: 10, achievements: 6 },
];

export default function RewardsPage() {
  const health = calculateFinancialHealthScore(MONTHLY_INCOME, mockExpenses, mockBudgets);
  const currentStreak = 15;
  const totalPoints = 780;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background lg:pl-64">
        <SidebarNav />

        {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Rewards & Gamification</h1>
              <p className="text-muted-foreground text-sm">
                Earn badges and climb the leaderboard with smart spending
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <p className="text-muted-foreground text-sm font-medium">Current Streak</p>
              </div>
              <p className="text-4xl font-bold text-orange-600">{currentStreak}</p>
              <p className="text-xs text-muted-foreground mt-1">days in a row</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <p className="text-muted-foreground text-sm font-medium">Total Points</p>
              </div>
              <p className="text-4xl font-bold text-yellow-600">{totalPoints}</p>
              <p className="text-xs text-muted-foreground mt-1">lifetime score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <p className="text-muted-foreground text-sm font-medium">Level</p>
              </div>
              <p className="text-4xl font-bold text-purple-600">8</p>
              <p className="text-xs text-muted-foreground mt-1">Financial Expert</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Health Score */}
          <div className="lg:col-span-1">
            <HealthScoreCard health={health} />
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Leaderboard entries={leaderboardData} currentUserName="You" />
          </div>
        </div>

        {/* Challenges */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Active Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">7-Day Streak</h3>
                  <span className="text-sm font-bold text-green-600">In Progress</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Log expenses for 7 consecutive days
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: '75%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">5 of 7 days</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Budget Champion</h3>
                  <span className="text-sm font-bold text-blue-600">In Progress</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Stay under budget for all categories this month
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: '60%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">3 of 5 categories</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Saver's Goal</h3>
                  <span className="text-sm font-bold text-purple-600">In Progress</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Save 30% of monthly income
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: '85%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">25.5% of 30% saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <div>
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <AchievementBadges achievements={mockAchievements} />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
}
