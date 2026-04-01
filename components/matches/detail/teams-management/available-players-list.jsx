// components/matches/detail/teams-management/available-players-list.jsx
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/utils/supabase/client";

const MIN_MATCHES_FOR_WIN_RATE = 8;

export default function AvailablePlayersList({
  availablePlayers,
  addPlayerToTeam,
}) {
  const [playerStats, setPlayerStats] = useState({});

  // Fetch player statistics for winning percentages
  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (availablePlayers.length === 0) return;

      const playerIds = availablePlayers.map((p) => p.id).filter(Boolean);

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
  }, [availablePlayers]);

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

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Available Players</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availablePlayers.map((player) => {
          const stats = playerStats[player.id];
          const showWinRate = stats && stats.matches_played >= MIN_MATCHES_FOR_WIN_RATE;

          return (
            <div
              key={player.id}
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <div className="flex items-center min-w-0 flex-1">
                <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                  <AvatarImage src={player.avatar_url} alt={player.full_name} />
                  <AvatarFallback>{getInitials(player.full_name)}</AvatarFallback>
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
              <div className="flex space-x-1 ml-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addPlayerToTeam(player, 1)}
                  className="h-7 px-2"
                >
                  T1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addPlayerToTeam(player, 2)}
                  className="h-7 px-2"
                >
                  T2
                </Button>
              </div>
            </div>
          );
        })}

        {availablePlayers.length === 0 && (
          <div className="col-span-1 sm:col-span-2 text-center py-8 text-muted-foreground">
            No available players yet. Players need to mark themselves as
            available first.
          </div>
        )}
      </div>
    </div>
  );
}
