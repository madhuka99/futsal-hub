// components/matches/detail/teams-management/team-players-list.jsx
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Star } from "lucide-react";
import { supabaseBrowser } from "@/utils/supabase/client";

const MIN_MATCHES_FOR_WIN_RATE = 8;

export default function TeamPlayersList({
  players,
  teamNumber,
  removePlayerFromTeam = null,
  isEditing = false,
  isBestBalance = false,
}) {
  const [playerStats, setPlayerStats] = useState({});

  // Fetch player statistics for winning percentages
  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (players.length === 0) return;

      const playerIds = players.map((p) => p.id).filter(Boolean);

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
  }, [players]);

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

  // Calculate team average win rate (only for rated players)
  const calculateTeamAverage = () => {
    const ratedPlayers = players.filter((player) => {
      const stats = playerStats[player.id];
      return stats && stats.matches_played >= MIN_MATCHES_FOR_WIN_RATE;
    });

    if (ratedPlayers.length === 0) return null;

    const totalWinRate = ratedPlayers.reduce((sum, player) => {
      return sum + (playerStats[player.id]?.win_percentage || 0);
    }, 0);

    return totalWinRate / ratedPlayers.length;
  };

  const teamAverage = calculateTeamAverage();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Team {teamNumber}</h3>
          {isBestBalance && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
              Best
            </Badge>
          )}
        </div>
        {teamAverage !== null && (
          <span className="text-xs text-muted-foreground">
            Avg: {teamAverage.toFixed(0)}%
          </span>
        )}
      </div>
      {players.length > 0 ? (
        <div className="space-y-3">
          {players.map((player) => {
            const stats = playerStats[player.id];
            const showWinRate = stats && stats.matches_played >= MIN_MATCHES_FOR_WIN_RATE;

            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center overflow-hidden min-w-0 flex-1">
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                    <AvatarImage src={player.avatar_url} alt={player.full_name} />
                    <AvatarFallback>
                      {getInitials(player.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {player.full_name}
                  </span>
                  {showWinRate && (
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {stats.win_percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
                {isEditing && removePlayerFromTeam && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlayerFromTeam(player.id, teamNumber)}
                    className="h-7 w-7 p-0 ml-2 flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No players assigned
        </div>
      )}
    </div>
  );
}
