// StatCards.jsx
"use client";
import React from "react";
import { Users, Calendar, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GiSoccerBall } from "react-icons/gi";

export function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <Users className="h-8 w-8 text-primary mb-2" />
          <p className="text-2xl font-bold">{stats.totalPlayers}</p>
          <p className="text-sm text-muted-foreground">Players</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <Calendar className="h-8 w-8 text-primary mb-2" />
          <p className="text-2xl font-bold">{stats.totalMatches}</p>
          <p className="text-sm text-muted-foreground">Total Matches</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <Trophy className="h-8 w-8 text-primary mb-2" />
          <p className="text-2xl font-bold">{stats.winRate}%</p>
          <p className="text-sm text-muted-foreground">Win Rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <GiSoccerBall className="h-8 w-8 text-primary mb-2" />
          <p className="text-2xl font-bold">{stats.upcomingMatches}</p>
          <p className="text-sm text-muted-foreground">Upcoming</p>
        </CardContent>
      </Card>
    </div>
  );
}
