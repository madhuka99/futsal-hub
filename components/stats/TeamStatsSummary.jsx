// TeamStatsSummary.jsx
"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Timer, Calendar } from "lucide-react";
import { GiSoccerBall, GiSoccerField } from "react-icons/gi";
import { FaFutbol } from "react-icons/fa";

export function TeamStatsSummary({ teamStats }) {
  const StatItem = ({ icon, value, label, className = "" }) => (
    <div className="flex flex-col items-center p-4">
      <div className={`rounded-full p-3 ${className} mb-3`}>{icon}</div>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground text-center mt-1">
        {label}
      </span>
    </div>
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <StatItem
            icon={<Trophy className="h-5 w-5 text-primary" />}
            value={`${teamStats.winRate}%`}
            label="Win Rate"
            className="bg-primary/10"
          />
          <StatItem
            icon={<Calendar className="h-5 w-5 text-primary" />}
            value={teamStats.totalMatches}
            label="Matches"
            className="bg-primary/10"
          />
          <StatItem
            icon={<GiSoccerBall className="h-5 w-5 text-primary" />}
            value={teamStats.goalsScored}
            label="Goals Scored"
            className="bg-primary/10"
          />
          <StatItem
            icon={<FaFutbol className="h-5 w-5 text-primary" />}
            value={teamStats.goalsConceded}
            label="Goals Conceded"
            className="bg-primary/10"
          />
          <StatItem
            icon={<GiSoccerField className="h-5 w-5 text-primary" />}
            value={`${teamStats.cleanSheets}`}
            label="Clean Sheets"
            className="bg-primary/10"
          />
          <StatItem
            icon={<Timer className="h-5 w-5 text-primary" />}
            value={teamStats.avgGoalsPerMatch.toFixed(1)}
            label="Goals per Match"
            className="bg-primary/10"
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded-lg p-3">
            <span className="text-xl font-bold block">{teamStats.wins}</span>
            <span className="text-xs text-muted-foreground">Wins</span>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <span className="text-xl font-bold block">{teamStats.draws}</span>
            <span className="text-xs text-muted-foreground">Draws</span>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <span className="text-xl font-bold block">{teamStats.losses}</span>
            <span className="text-xs text-muted-foreground">Losses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
