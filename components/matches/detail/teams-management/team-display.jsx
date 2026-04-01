// components/matches/detail/teams-management/team-display.jsx
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabaseBrowser } from "@/utils/supabase/client";

const MIN_MATCHES_FOR_WIN_RATE = 8;

export default function TeamDisplay({ teamNumber, playersInMatch }) {
  const [playerStats, setPlayerStats] = useState({});

  // Fetch player statistics for winning percentages
  useEffect(() => {
    const fetchPlayerStats = async () => {
      const teamPlayers = playersInMatch.filter(
        (p) => p.team_number === teamNumber
      );

      if (teamPlayers.length === 0) return;

      const playerIds = teamPlayers
        .map((p) => p.player?.id)
        .filter(Boolean);

      if (playerIds.length === 0) return;

      const { data, error } = await supabaseBrowser
        .from("player_statistics")
        .select("id, matches_played, win_percentage")
        .in("id", playerIds);

      if (!error && data) {
        const statsMap = {};
        data.forEach((stat) => {
          statsMap[stat.id] = {
            matches_played: stat.matches_played || 0,
            win_percentage: stat.win_percentage || 0,
          };
        });
        setPlayerStats(statsMap);
      }
    };

    fetchPlayerStats();
  }, [playersInMatch, teamNumber]);

  // Format player name initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const teamPlayers = playersInMatch.filter(
    (p) => p.team_number === teamNumber
  );

  // Calculate team average win rate (only for rated players)
  const calculateTeamAverage = () => {
    const ratedPlayers = teamPlayers.filter((p) => {
      const stats = playerStats[p.player?.id];
      return stats && stats.matches_played >= MIN_MATCHES_FOR_WIN_RATE;
    });

    if (ratedPlayers.length === 0) return null;

    const totalWinRate = ratedPlayers.reduce((sum, p) => {
      return sum + (playerStats[p.player?.id]?.win_percentage || 0);
    }, 0);

    return totalWinRate / ratedPlayers.length;
  };

  const teamAverage = calculateTeamAverage();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Team {teamNumber}</h3>
        {teamAverage !== null && (
          <span className="text-xs text-muted-foreground">
            Avg: {teamAverage.toFixed(0)}%
          </span>
        )}
      </div>
      {teamPlayers.length > 0 ? (
        <div className="space-y-3">
          {teamPlayers.map((player) => {
            const stats = playerStats[player.player?.id];
            const showWinRate = stats && stats.matches_played >= MIN_MATCHES_FOR_WIN_RATE;

            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 border rounded-md overflow-hidden"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                    <AvatarImage
                      src={player.player?.avatar_url}
                      alt={player.player?.full_name}
                    />
                    <AvatarFallback>
                      {getInitials(player.player?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {player.player?.full_name}
                  </span>
                </div>
                {showWinRate && (
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {stats.win_percentage.toFixed(0)}% W
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No players assigned yet
        </div>
      )}
    </div>
  );
}
