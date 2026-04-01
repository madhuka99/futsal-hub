// components/matches/detail/teams-management/player-couples-manager.jsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, X, Shuffle, TrendingUp, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/utils/supabase/client";

const MIN_MATCHES_FOR_WIN_RATE = 8;

export default function PlayerCouplesManager({
  playerCouples,
  availability,
  team1Players,
  team2Players,
  availablePlayers,
  addPlayerCouple,
  updatePlayerCouple,
  removePlayerCouple,
  autoBalanceTeams,
  autoBalanceByWinRate,
  autoBalanceStatus,
}) {
  const [playerStats, setPlayerStats] = useState({});

  // Fetch player statistics
  useEffect(() => {
    const fetchPlayerStats = async () => {
      const playerIds = availability
        .map((a) => a.player?.id)
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
  }, [availability]);

  // Helper to format player display name with win rate
  const getPlayerDisplayName = (player) => {
    if (!player) return "";
    const stats = playerStats[player.id];
    if (stats && stats.matches_played >= MIN_MATCHES_FOR_WIN_RATE) {
      return `${player.full_name} (${stats.win_percentage.toFixed(0)}%)`;
    }
    return player.full_name;
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="font-medium">Player Skill Couples</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addPlayerCouple}
          disabled={availablePlayers.length < 2}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Couple
        </Button>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create couples of players with similar skill levels. The system will
          assign them to different teams to ensure balance.
        </p>

        {playerCouples.length > 0 ? (
          <div className="space-y-3">
            {playerCouples.map((couple) => (
              <div
                key={couple.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-2 md:p-3 border rounded-md"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePlayerCouple(couple.id)}
                  className="h-8 w-8 p-0 sm:ml-2 self-end sm:self-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <Select
                    value={couple.player1?.id || ""}
                    onValueChange={(value) =>
                      updatePlayerCouple(couple.id, "player1", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select player 1">
                        {couple.player1 ? getPlayerDisplayName(couple.player1) : "Select player 1"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availability
                        .filter((a) => a.status === "available")
                        .filter(
                          (a) =>
                            a.player?.id !== couple.player2?.id &&
                            !playerCouples.some(
                              (c) =>
                                c.id !== couple.id &&
                                (c.player1?.id === a.player?.id ||
                                  c.player2?.id === a.player?.id)
                            ) &&
                            !team1Players.some((p) => p.id === a.player?.id) &&
                            !team2Players.some((p) => p.id === a.player?.id)
                        )
                        .map((a) => (
                          <SelectItem key={a.player?.id} value={a.player?.id}>
                            {getPlayerDisplayName(a.player)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={couple.player2?.id || ""}
                    onValueChange={(value) =>
                      updatePlayerCouple(couple.id, "player2", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select player 2">
                        {couple.player2 ? getPlayerDisplayName(couple.player2) : "Select player 2"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availability
                        .filter((a) => a.status === "available")
                        .filter(
                          (a) =>
                            a.player?.id !== couple.player1?.id &&
                            !playerCouples.some(
                              (c) =>
                                c.id !== couple.id &&
                                (c.player1?.id === a.player?.id ||
                                  c.player2?.id === a.player?.id)
                            ) &&
                            !team1Players.some((p) => p.id === a.player?.id) &&
                            !team2Players.some((p) => p.id === a.player?.id)
                        )
                        .map((a) => (
                          <SelectItem key={a.player?.id} value={a.player?.id}>
                            {getPlayerDisplayName(a.player)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <Button
                onClick={autoBalanceByWinRate}
                disabled={
                  playerCouples.some((c) => !c.player1 || !c.player2) ||
                  autoBalanceStatus === "balancing"
                }
                className="w-full"
              >
                {autoBalanceStatus === "balancing" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Balancing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Balance by Stats
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={autoBalanceTeams}
                disabled={
                  playerCouples.some((c) => !c.player1 || !c.player2) ||
                  autoBalanceStatus === "balancing"
                }
                className="w-full"
              >
                {autoBalanceStatus === "balancing" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Balancing...
                  </>
                ) : (
                  <>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Random Split
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
            No player couples defined yet. Click "Add Couple" to start.
          </div>
        )}
      </div>
    </div>
  );
}
