'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Achievement } from '@/lib/types';

interface AchievementBadgesProps {
  achievements: Achievement[];
}

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                achievement.unlockedAt
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 dark:from-yellow-950 dark:to-orange-950 dark:border-yellow-800'
                  : 'bg-muted border-muted-foreground/20 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h4 className="text-xs font-bold mb-1">{achievement.title}</h4>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
              {achievement.unlockedAt && (
                <p className="text-xs text-green-600 mt-2 font-semibold">
                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
