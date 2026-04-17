'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  streak: number;
  achievements: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserName?: string;
}

export function Leaderboard({ entries, currentUserName }: LeaderboardProps) {
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Financial Health Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                currentUserName === entry.name
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 flex justify-center">{getMedalIcon(entry.rank)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {entry.name}
                    {currentUserName === entry.name && (
                      <span className="ml-2 text-xs text-primary">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.streak} day streak • {entry.achievements} achievements
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{entry.score}</p>
                <p className="text-xs text-muted-foreground">score</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
