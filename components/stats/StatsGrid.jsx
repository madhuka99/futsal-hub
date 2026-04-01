// components/stats/StatsGrid.jsx
"use client";

import { Calendar, Target, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsGrid({ playerStats, stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Matches Played */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Matches</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{playerStats.matches_played}</div>
          <p className="text-xs text-muted-foreground">
            Total matches
          </p>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Goals</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{playerStats.total_goals}</div>
          <p className="text-xs text-muted-foreground">
            {stats.goalsPerMatch.toFixed(1)} per match
          </p>
        </CardContent>
      </Card>

      {/* Assists */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assists</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{playerStats.total_assists}</div>
          <p className="text-xs text-muted-foreground">
            {stats.assistsPerMatch.toFixed(1)} per match
          </p>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(stats.winRate || 0)}%</div>
          <p className="text-xs text-muted-foreground">
            {playerStats.wins}W - {playerStats.draws}D - {playerStats.losses}L
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
