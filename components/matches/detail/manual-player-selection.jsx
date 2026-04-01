// components/matches/detail/teams-management/manual-player-selection.jsx
import { useState, useEffect } from "react";
import { Search, Plus, X, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabaseBrowser } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function ManualPlayerSelection({
  matchId,
  manuallyAddedPlayers,
  playersInMatch,
  availability,
  onPlayersUpdate,
}) {
  const [allPlayers, setAllPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all registered players
  useEffect(() => {
    const fetchAllPlayers = async () => {
      setIsLoading(true);
      try {
        const { data: players, error } = await supabaseBrowser
          .from("profiles")
          .select("id, full_name, avatar_url, email, preferred_position")
          .order("full_name");

        if (error) throw error;
        setAllPlayers(players || []);
      } catch (error) {
        console.error("Error fetching players:", error);
        toast.error("Failed to load players");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPlayers();
  }, []);

  // Filter players based on search term
  const filteredPlayers = allPlayers.filter((player) =>
    player.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get players that are already involved in the match
  const getPlayerStatus = (playerId) => {
    // Check if player is already in a team
    const inTeam = playersInMatch.find((p) => p.player?.id === playerId);
    if (inTeam) {
      return { status: "in_team", team: inTeam.team_number };
    }

    // Check if player is manually added (check this before general availability)
    const manuallyAdded = manuallyAddedPlayers.find(
      (p) => p.player?.id === playerId
    );
    if (manuallyAdded) {
      return { status: "manually_added" };
    }

    // Check if player has marked availability (natural availability, not manually added)
    const hasAvailability = availability.find((a) => a.player?.id === playerId);
    if (hasAvailability) {
      return {
        status: "has_availability",
        availability: hasAvailability.status,
      };
    }

    return { status: "not_involved" };
  };

  // Add player manually to the match
  const addPlayerManually = async (player) => {
    try {
      // Add to availability table as "available" status
      const { error } = await supabaseBrowser.from("availability").insert({
        match_id: matchId,
        user_id: player.id,
        status: "available",
      });

      if (error) throw error;

      // Update local state
      const newManualPlayer = {
        id: Date.now(), // temporary id for availability record
        match_id: matchId,
        user_id: player.id,
        status: "available",
        player: player,
        updated_at: new Date().toISOString(),
      };

      onPlayersUpdate([...manuallyAddedPlayers, newManualPlayer]);
      toast.success(`${player.full_name} added to match`);
    } catch (error) {
      console.error("Error adding player:", error);
      toast.error("Failed to add player");
    }
  };

  // Remove manually added player
  const removePlayerManually = async (playerId) => {
    try {
      // Remove from availability table
      const { error } = await supabaseBrowser
        .from("availability")
        .delete()
        .eq("match_id", matchId)
        .eq("user_id", playerId);

      if (error) throw error;

      // Update local state - remove from manually added players
      const updatedPlayers = manuallyAddedPlayers.filter(
        (p) => p.player?.id !== playerId
      );
      onPlayersUpdate(updatedPlayers);

      const player = allPlayers.find((p) => p.id === playerId);
      toast.success(`${player?.full_name} removed from match`);
    } catch (error) {
      console.error("Error removing player:", error);
      toast.error("Failed to remove player");
    }
  };

  const getStatusBadge = (playerStatus) => {
    switch (playerStatus.status) {
      case "in_team":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-xs">
            Team {playerStatus.team}
          </Badge>
        );
      case "has_availability":
        return (
          <Badge
            className="text-xs"
            variant={
              playerStatus.availability === "available"
                ? "default"
                : playerStatus.availability === "maybe"
                ? "secondary"
                : "destructive"
            }
          >
            {playerStatus.availability}
          </Badge>
        );
      case "manually_added":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-xs">
            Added
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Manual Player Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-3 sm:px-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-base"
          />
        </div>

        {/* Players List */}
        <div className="max-h-80 sm:max-h-96 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading players...
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No players found" : "No players available"}
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const playerStatus = getPlayerStatus(player.id);
              const isInvolvedInMatch = playerStatus.status !== "not_involved";
              const canAdd = playerStatus.status === "not_involved";
              const canRemove = playerStatus.status === "manually_added";

              return (
                <div
                  key={player.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Player Info Section */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarImage
                        src={player.avatar_url}
                        alt={player.full_name}
                      />
                      <AvatarFallback className="text-sm">
                        {player.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {player.full_name}
                      </p>
                      {player.preferred_position && (
                        <p className="text-xs text-muted-foreground truncate">
                          Position: {player.preferred_position}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status and Actions Section */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {getStatusBadge(playerStatus)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {canAdd && (
                        <Button
                          size="sm"
                          onClick={() => addPlayerManually(player)}
                          className="flex items-center gap-1 h-8 px-3 text-xs sm:text-sm"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">Add</span>
                        </Button>
                      )}

                      {canRemove && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removePlayerManually(player.id)}
                          className="flex items-center gap-1 h-8 px-3 text-xs sm:text-sm"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">Remove</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Manually added players:</span>
            <Badge variant="outline" className="text-xs">
              {manuallyAddedPlayers.length}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
