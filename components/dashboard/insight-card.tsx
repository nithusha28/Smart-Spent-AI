'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Insight } from '@/lib/types';
import { AlertCircle, TrendingUp, Lightbulb, CheckCircle, Zap } from 'lucide-react';

interface InsightCardProps {
  insight: Insight;
}

const iconMap: { [key: string]: React.ReactNode } = {
  alert: <AlertCircle className="w-4 h-4" />,
  warning: <AlertCircle className="w-4 h-4" />,
  pattern: <TrendingUp className="w-4 h-4" />,
  suggestion: <Lightbulb className="w-4 h-4" />,
  achievement: <CheckCircle className="w-4 h-4" />,
};

const colorMap: { [key: string]: string } = {
  alert: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
  warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
  pattern: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
  suggestion: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  achievement: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
};

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <Card className={`border-l-4 ${colorMap[insight.type] || colorMap.pattern}`}>
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-1">{insight.icon || iconMap[insight.type]}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
            {insight.actionable && (
              <button className="text-xs font-medium text-primary hover:underline">
                Take Action →
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
