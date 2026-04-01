// PlayerStatsSummary.jsx
"use client";
import React from "react";
import { User, Award, TrendingUp } from "lucide-react";
import { GiSoccerBall } from "react-icons/gi";

export function PlayerStatsSummary({ players }) {
  // Helper function to get first name from full_name
  const getFirstName = (fullName) => {
    if (!fullName) return "Unknown";
    return fullName.split(" ")[0];
  };

  // Find top scorer (only consider players with at least 1 goal)
  const validScorers = players.filter((player) => player.total_goals > 0);
  const topScorer =
    validScorers.length > 0
      ? validScorers.reduce(
          (max, player) =>
            player.total_goals > max.total_goals ? player : max,
          validScorers[0]
        )
      : null;

  // Find top assister (only consider players with at least 1 assist)
  const validAssisters = players.filter((player) => player.total_assists > 0);
  const topAssister =
    validAssisters.length > 0
      ? validAssisters.reduce(
          (max, player) =>
            player.total_assists > max.total_assists ? player : max,
          validAssisters[0]
        )
      : null;

  // Find Highest Win Rate (only consider players with at least 10 matches)
  const validWinRatePlayers = players.filter((player) => player.matches_played >= 10);
  const topWinRatePlayer =
    validWinRatePlayers.length > 0
      ? validWinRatePlayers.reduce(
          (max, player) => (player.win_percentage > max.win_percentage ? player : max),
          validWinRatePlayers[0]
        )
      : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-card text-card-foreground p-3 sm:p-4 rounded-lg border border-border">
        <h3 className="text-xs sm:text-lg flex items-center font-medium text-muted-foreground mb-1">
          <User className="mr-2 text-primary" size={18} />
          Total Players
        </h3>
        <p className="md:text-2xl font-semibold ">{players.length}</p>
      </div>

      <div className="bg-card text-card-foreground p-3 sm:p-4 rounded-lg border border-border">
        <h3 className="text-xs sm:text-lg flex items-center font-medium text-muted-foreground mb-1">
          <GiSoccerBall className="mr-2 text-primary" size={18} />
          Top Scorer
        </h3>
        <p className="md:text-2xl font-semibold flex items-center">
          <span className="truncate">
            {topScorer
              ? `${getFirstName(topScorer.full_name)} | ${
                  topScorer.total_goals
                }`
              : "No goals scored yet"}
          </span>
        </p>
      </div>

      <div className="bg-card text-card-foreground p-3 sm:p-4 rounded-lg border border-border">
        <h3 className="text-xs sm:text-lg flex items-center font-medium text-muted-foreground mb-1">
          <Award className="mr-2 text-primary" size={18} />
          Most Assists
        </h3>
        <p className="md:text-2xl font-semibold flex items-center">
          <span className="truncate">
            {topAssister
              ? `${getFirstName(topAssister.full_name)} | ${
                  topAssister.total_assists
                }`
              : "No assists recorded yet"}
          </span>
        </p>
      </div>

      <div className="bg-card text-card-foreground p-3 sm:p-4 rounded-lg border border-border">
        <h3 className="text-xs sm:text-lg flex items-center font-medium text-muted-foreground mb-1">
          <TrendingUp className="mr-2 text-primary" size={18} />
          Highest Win %
        </h3>
        <p className="md:text-2xl font-semibold flex items-center">
          <span className="truncate">
            {topWinRatePlayer
              ? `${getFirstName(topWinRatePlayer.full_name)} | ${Math.round(topWinRatePlayer.win_percentage)}%`
              : "No eligible players yet"}
          </span>
        </p>
      </div>
    </div>
  );
}
