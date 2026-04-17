'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialHealth } from '@/lib/types';

interface HealthScoreCardProps {
  health: FinancialHealth;
}

export function HealthScoreCard({ health }: HealthScoreCardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string): string => {
    if (risk === 'Low') return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
    if (risk === 'Medium') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
      <CardHeader>
        <CardTitle className="text-lg">Financial Health Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground/20"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${(health.score / 100) * 282.7} 282.7`}
                className={`${getScoreColor(health.score)} transition-all`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(health.score)}`}>
                  {health.score}
                </div>
                <div className="text-xs text-muted-foreground">score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Savings Rate</span>
              <span className="text-sm font-bold text-green-600">{health.savingsRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(health.savingsRate, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Budget Adherence</span>
              <span className="text-sm font-bold text-blue-600">{health.budgetAdherence}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(health.budgetAdherence, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Expense Discipline</span>
              <span className="text-sm font-bold text-purple-600">{health.expenseDiscipline}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(health.expenseDiscipline, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className={`text-center py-2 rounded-lg ${getRiskColor(health.riskLevel)}`}>
          <span className="text-sm font-semibold">Risk Level: {health.riskLevel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
