// components/matches/detail/player-stats/stats-editor.jsx
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabaseBrowser } from "@/utils/supabase/client";

export default function StatsEditor({
  match,
  playersInMatch,
  userId,
  onUpdate,
  isUpcoming,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerStats, setPlayerStats] = useState([]);

  // Initialize player stats from playersInMatch
  useEffect(() => {
    if (playersInMatch?.length > 0) {
      setPlayerStats(
        playersInMatch.map((player) => ({
          id: player.id,
          userId: player.user_id,
          teamNumber: player.team_number,
          goals: player.goals || 0,
          assists: player.assists || 0,
          playerName: player.player?.full_name,
          avatarUrl: player.player?.avatar_url,
        }))
      );
    }
  }, [playersInMatch]);

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

  // Handle stat change
  const handleStatChange = (id, field, value) => {
    // Convert to integer and ensure it's not negative
    const numValue = parseInt(value) || 0;
    const validValue = numValue >= 0 ? numValue : 0;

    setPlayerStats(
      playerStats.map((player) =>
        player.id === id ? { ...player, [field]: validValue } : player
      )
    );
  };

  // Save player stats
  const handleSaveStats = async () => {
    setIsSubmitting(true);
    try {
      // Update each player's stats in the match_players table ONLY
      for (const player of playerStats) {
        const { error } = await supabaseBrowser
          .from("match_players")
          .update({
            goals: player.goals,
            assists: player.assists,
          })
          .eq("id", player.id);

        if (error) throw error;
      }


      // Get updated match_players data
      const { data: updatedPlayers } = await supabaseBrowser
        .from("match_players")
        .select(
          `
        *,
        player:profiles(id, full_name, avatar_url, email)
      `
        )
        .eq("match_id", match.id);

      // Call the onUpdate callback to refresh the parent component
      onUpdate(updatedPlayers || []);

      toast.success("Player statistics updated successfully");
    } catch (error) {
      console.error("Error saving player stats:", error);
      toast.error("Failed to update player statistics");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUpcoming) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Player Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            Player statistics will be available after the match has been played.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="team1">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="team1">Team 1</TabsTrigger>
            <TabsTrigger value="team2">Team 2</TabsTrigger>
          </TabsList>

          {[1, 2].map((teamNumber) => (
            <TabsContent key={teamNumber} value={`team${teamNumber}`}>
              <div className="space-y-4">
                {playerStats
                  .filter((player) => player.teamNumber === teamNumber)
                  .map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                          <AvatarImage
                            src={player.avatarUrl}
                            alt={player.playerName}
                          />
                          <AvatarFallback>
                            {getInitials(player.playerName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {player.playerName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground mb-1">
                            Goals
                          </span>
                          <Input
                            type="number"
                            min="0"
                            value={player.goals}
                            onChange={(e) =>
                              handleStatChange(
                                player.id,
                                "goals",
                                e.target.value
                              )
                            }
                            className="h-8 w-16 text-center"
                          />
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground mb-1">
                            Assists
                          </span>
                          <Input
                            type="number"
                            min="0"
                            value={player.assists}
                            onChange={(e) =>
                              handleStatChange(
                                player.id,
                                "assists",
                                e.target.value
                              )
                            }
                            className="h-8 w-16 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                {playerStats.filter(
                  (player) => player.teamNumber === teamNumber
                ).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No players in this team.
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Button
          onClick={handleSaveStats}
          disabled={isSubmitting}
          className="w-full mt-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Statistics
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
