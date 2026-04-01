// components/stats/RecentMatches.jsx
"use client";

import { Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentMatches({ recentMatches }) {
  // Get match result for recent matches
  const getMatchResult = (matchPlayer) => {
    const match = matchPlayer.match;
    if (!match || match.team1_score === null || match.team2_score === null) {
      return "TBD";
    }

    const userTeam = matchPlayer.team_number;
    const userTeamScore =
      userTeam === 1 ? match.team1_score : match.team2_score;
    const opponentScore =
      userTeam === 1 ? match.team2_score : match.team1_score;

    if (userTeamScore > opponentScore) return "W";
    if (userTeamScore < opponentScore) return "L";
    return "D";
  };

  // Get result badge variant
  const getResultBadgeVariant = (result) => {
    switch (result) {
      case "W":
        return "default";
      case "L":
        return "destructive";
      case "D":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (recentMatches.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Recent Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentMatches.map((matchPlayer, index) => {
            const match = matchPlayer.match;
            const result = getMatchResult(matchPlayer);

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={getResultBadgeVariant(result)}>
                    {result}
                  </Badge>
                  <div>
                    <p className="font-medium">{match.location}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(match.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {match.team1_score !== null
                      ? `${match.team1_score} - ${match.team2_score}`
                      : "TBD"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Team {matchPlayer.team_number}
                  </div>
                  {matchPlayer.goals > 0 || matchPlayer.assists > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      {matchPlayer.goals}G {matchPlayer.assists}A
                      {matchPlayer.is_mvp && " 🏆"}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
