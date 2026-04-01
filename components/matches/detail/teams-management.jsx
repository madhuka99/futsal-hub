// components/matches/detail/teams-management.jsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabaseBrowser } from "@/utils/supabase/client";
import { Edit, Save, Loader2, Users, RefreshCw, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvailablePlayersList from "./teams-management/available-players-list";
import TeamPlayersList from "./teams-management/team-players-list";
import PlayerCouplesManager from "./teams-management/player-couples-manager";
import TeamDisplay from "./teams-management/team-display";
import ManualPlayerSelection from "./manual-player-selection";

export default function TeamsManagement({
  match,
  playersInMatch,
  availability,
  isUpcoming,
  userRole,
  onUpdate,
  onAvailabilityUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmittingTeams, setIsSubmittingTeams] = useState(false);
  const [team1Players, setTeam1Players] = useState(
    playersInMatch.filter((p) => p.team_number === 1).map((p) => p.player)
  );
  const [team2Players, setTeam2Players] = useState(
    playersInMatch.filter((p) => p.team_number === 2).map((p) => p.player)
  );
  const [teamAssignmentMode, setTeamAssignmentMode] = useState("manual");

  // State for skill couples
  const [playerCouples, setPlayerCouples] = useState([]);
  const [autoBalanceStatus, setAutoBalanceStatus] = useState("idle");
  const [isBestBalance, setIsBestBalance] = useState(false);
  const [lastSolution, setLastSolution] = useState(null); // Track last balance solution

  // State for manually added players
  const [manuallyAddedPlayers, setManuallyAddedPlayers] = useState([]);

  // Get all available players (including manually added ones)
  const getAllAvailablePlayers = () => {
    const availableFromAvailability = availability
      .filter((a) => a.status === "available")
      .map((a) => a.player);

    const manuallyAddedPlayersList = manuallyAddedPlayers.map((a) => a.player);

    // Combine and deduplicate
    const allAvailable = [
      ...availableFromAvailability,
      ...manuallyAddedPlayersList,
    ];
    const uniqueAvailable = allAvailable.filter(
      (player, index, self) =>
        player && self.findIndex((p) => p && p.id === player.id) === index
    );

    return uniqueAvailable;
  };

  // Get available players not assigned to teams
  const availablePlayers = getAllAvailablePlayers().filter(
    (p) =>
      p &&
      !team1Players.some((t1p) => t1p.id === p.id) &&
      !team2Players.some((t2p) => t2p.id === p.id) &&
      !playerCouples.some(
        (couple) => couple.player1?.id === p.id || couple.player2?.id === p.id
      )
  );

  // Add player to team
  const addPlayerToTeam = (player, team) => {
    if (team === 1) {
      if (!team1Players.find((p) => p.id === player.id)) {
        setTeam1Players([...team1Players, player]);
      }
    } else {
      if (!team2Players.find((p) => p.id === player.id)) {
        setTeam2Players([...team2Players, player]);
      }
    }
    // Clear last solution when manually changing teams
    setLastSolution(null);
    setIsBestBalance(false);
  };

  // Remove player from team
  const removePlayerFromTeam = (playerId, team) => {
    if (team === 1) {
      setTeam1Players(team1Players.filter((p) => p.id !== playerId));
    } else {
      setTeam2Players(team2Players.filter((p) => p.id !== playerId));
    }
    // Clear last solution when manually changing teams
    setLastSolution(null);
    setIsBestBalance(false);
  };

  // Add player couple (players with similar skills)
  const addPlayerCouple = () => {
    if (availablePlayers.length < 2) {
      toast.error("Not enough available players to create a couple");
      return;
    }

    setPlayerCouples([
      ...playerCouples,
      { id: Date.now(), player1: null, player2: null },
    ]);
  };

  // Update player in a couple
  const updatePlayerCouple = (coupleId, position, playerId) => {
    setPlayerCouples(
      playerCouples.map((couple) => {
        if (couple.id === coupleId) {
          const allAvailable = getAllAvailablePlayers();
          const selectedPlayer = allAvailable.find(
            (player) => player?.id === playerId
          );

          return {
            ...couple,
            [position]: selectedPlayer,
          };
        }
        return couple;
      })
    );
  };

  // Remove a player couple
  const removePlayerCouple = (coupleId) => {
    setPlayerCouples(playerCouples.filter((couple) => couple.id !== coupleId));
  };

  // Auto-balance teams based on player couples (random split)
  const autoBalanceTeams = () => {
    // Validate that all couples have both players set
    const invalidCouples = playerCouples.filter(
      (couple) => !couple.player1 || !couple.player2
    );

    if (invalidCouples.length > 0) {
      toast.error("All player couples must have both players selected");
      return;
    }

    setAutoBalanceStatus("balancing");

    try {
      // Clear current teams
      setTeam1Players([]);
      setTeam2Players([]);

      // Randomly assign one player from each couple to team 1, the other to team 2
      playerCouples.forEach((couple) => {
        // Coin flip to decide which player goes to which team
        if (Math.random() > 0.5) {
          setTeam1Players((prev) => [...prev, couple.player1]);
          setTeam2Players((prev) => [...prev, couple.player2]);
        } else {
          setTeam1Players((prev) => [...prev, couple.player2]);
          setTeam2Players((prev) => [...prev, couple.player1]);
        }
      });

      // Handle any remaining available players (not in couples)
      const remainingPlayers = getAllAvailablePlayers().filter(
        (p) =>
          p &&
          !playerCouples.some(
            (couple) =>
              couple.player1?.id === p.id || couple.player2?.id === p.id
          )
      );

      // Alternate remaining players between teams
      remainingPlayers.forEach((player, index) => {
        if (index % 2 === 0) {
          setTeam1Players((prev) => [...prev, player]);
        } else {
          setTeam2Players((prev) => [...prev, player]);
        }
      });

      // Reset best balance flag and last solution for random split
      setIsBestBalance(false);
      setLastSolution(null);

      setAutoBalanceStatus("success");
      toast.success("Teams randomly split");
    } catch (error) {
      console.error("Error auto-balancing teams:", error);
      setAutoBalanceStatus("error");
      toast.error("Failed to auto-balance teams");
    }
  };

  const MIN_MATCHES_FOR_WIN_RATE = 8;
  const BALANCE_TOLERANCE = 5; // Team averages must be within 5% of each other
  const MAX_ATTEMPTS = 100; // Max attempts to find a different solution

  // Auto-balance teams by win rate (using couples system)
  const autoBalanceByWinRate = async () => {
    // Validate that all couples have both players set
    const invalidCouples = playerCouples.filter(
      (couple) => !couple.player1 || !couple.player2
    );

    if (invalidCouples.length > 0) {
      toast.error("All player couples must have both players selected");
      return;
    }

    setAutoBalanceStatus("balancing");

    try {
      // Get all players involved
      const allPlayers = getAllAvailablePlayers().filter(Boolean);
      const playerIds = allPlayers.map((p) => p.id);

      // Fetch player statistics
      const { data: statsData, error } = await supabaseBrowser
        .from("player_statistics")
        .select("id, matches_played, win_percentage")
        .in("id", playerIds);

      if (error) throw error;

      // Create a map of player stats
      const statsMap = {};
      (statsData || []).forEach((stat) => {
        statsMap[stat.id] = {
          matches_played: stat.matches_played || 0,
          win_percentage: stat.win_percentage || 0,
        };
      });

      // Helper to get win % (null if not enough matches)
      const getWinRate = (playerId) => {
        const stats = statsMap[playerId];
        if (stats && stats.matches_played >= MIN_MATCHES_FOR_WIN_RATE) {
          return stats.win_percentage;
        }
        return null;
      };

      // Get remaining players (not in couples)
      const remainingPlayers = allPlayers.filter(
        (p) =>
          !playerCouples.some(
            (couple) =>
              couple.player1?.id === p.id || couple.player2?.id === p.id
          )
      );

      // Separate rated and unrated remaining players
      const ratedRemaining = [];
      const unratedRemaining = [];

      remainingPlayers.forEach((player) => {
        const rate = getWinRate(player.id);
        if (rate !== null) {
          ratedRemaining.push({ ...player, win_percentage: rate });
        } else {
          unratedRemaining.push(player);
        }
      });

      // Helper: Check if two solutions are different
      const isDifferentSolution = (sol1, sol2) => {
        if (!sol1 || !sol2) return true;
        const team1Ids = sol1.team1.map(p => p.id).sort().join(',');
        const team2Ids = sol2.team1.map(p => p.id).sort().join(',');
        return team1Ids !== team2Ids;
      };

      // Helper: Generate a random solution
      const generateRandomSolution = () => {
        const team1 = [];
        const team2 = [];
        let sum1 = 0;
        let sum2 = 0;

        // Process couples - purely random assignment
        playerCouples.forEach((couple) => {
          const p1Rate = getWinRate(couple.player1?.id);
          const p2Rate = getWinRate(couple.player2?.id);

          // Flip a coin - 50/50 assignment
          if (Math.random() > 0.5) {
            team1.push(couple.player1);
            team2.push(couple.player2);
            if (p1Rate !== null) sum1 += p1Rate;
            if (p2Rate !== null) sum2 += p2Rate;
          } else {
            team1.push(couple.player2);
            team2.push(couple.player1);
            if (p2Rate !== null) sum1 += p2Rate;
            if (p1Rate !== null) sum2 += p1Rate;
          }
        });

        // Shuffle remaining rated players and assign to balance
        const shuffledRated = [...ratedRemaining].sort(() => Math.random() - 0.5);
        shuffledRated.forEach((player) => {
          // Calculate current averages
          const count1 = team1.filter(p => getWinRate(p.id) !== null).length;
          const count2 = team2.filter(p => getWinRate(p.id) !== null).length;
          const avg1 = count1 > 0 ? sum1 / count1 : 0;
          const avg2 = count2 > 0 ? sum2 / count2 : 0;

          // Assign to team with lower average
          if (avg1 <= avg2) {
            team1.push(player);
            sum1 += player.win_percentage;
          } else {
            team2.push(player);
            sum2 += player.win_percentage;
          }
        });

        // Shuffle and alternate unrated players
        const shuffledUnrated = [...unratedRemaining].sort(() => Math.random() - 0.5);
        shuffledUnrated.forEach((player, index) => {
          if (index % 2 === 0) {
            team1.push(player);
          } else {
            team2.push(player);
          }
        });

        // Calculate final averages
        const count1 = team1.filter(p => getWinRate(p.id) !== null).length;
        const count2 = team2.filter(p => getWinRate(p.id) !== null).length;
        const avg1 = count1 > 0 ? sum1 / count1 : 0;
        const avg2 = count2 > 0 ? sum2 / count2 : 0;

        return {
          team1,
          team2,
          avg1,
          avg2,
          diff: Math.abs(avg1 - avg2)
        };
      };

      // Try to find a balanced solution that's different from the last one
      let solution = null;
      let attempts = 0;
      let bestSolution = null;
      let bestDiff = Infinity;

      while (attempts < MAX_ATTEMPTS) {
        const candidate = generateRandomSolution();

        // Track the best solution found
        if (candidate.diff < bestDiff) {
          bestDiff = candidate.diff;
          bestSolution = candidate;
        }

        // Check if this solution is valid
        const isBalanced = candidate.diff <= BALANCE_TOLERANCE;
        const isDifferent = isDifferentSolution(candidate, lastSolution);

        if (isBalanced && isDifferent) {
          solution = candidate;
          break;
        }

        attempts++;
      }

      // If we couldn't find a different balanced solution, use the best one we found
      if (!solution) {
        solution = bestSolution;
      }

      // Update states
      setTeam1Players(solution.team1);
      setTeam2Players(solution.team2);
      setLastSolution(solution);

      // Check if this is the best possible balance
      const isBest = solution.diff <= 1.0;
      setIsBestBalance(isBest);

      setAutoBalanceStatus("success");

      if (isBest) {
        toast.success(
          `Best Balance! T1: ${solution.avg1.toFixed(0)}% avg, T2: ${solution.avg2.toFixed(0)}% avg`
        );
      } else {
        toast.success(
          `Balanced. T1: ${solution.avg1.toFixed(0)}% avg, T2: ${solution.avg2.toFixed(0)}% avg`
        );
      }
    } catch (error) {
      console.error("Error auto-balancing by win rate:", error);
      setAutoBalanceStatus("error");
      toast.error("Failed to auto-balance teams");
    }
  };

  // Handle manual player updates
  const handleManualPlayersUpdate = (updatedManualPlayers) => {
    setManuallyAddedPlayers(updatedManualPlayers);
  };

  // Save team assignments
  const handleSaveTeams = async () => {
    setIsSubmittingTeams(true);
    try {
      // Delete existing player assignments
      await supabaseBrowser
        .from("match_players")
        .delete()
        .eq("match_id", match.id);

      // Create team 1 player records
      if (team1Players.length > 0) {
        const team1Records = team1Players.map((player) => ({
          match_id: match.id,
          user_id: player.id,
          team_number: 1,
          goals: 0,
          assists: 0,
          is_mvp: false,
        }));

        const { error: team1Error } = await supabaseBrowser
          .from("match_players")
          .insert(team1Records);

        if (team1Error) throw team1Error;
      }

      // Create team 2 player records
      if (team2Players.length > 0) {
        const team2Records = team2Players.map((player) => ({
          match_id: match.id,
          user_id: player.id,
          team_number: 2,
          goals: 0,
          assists: 0,
          is_mvp: false,
        }));

        const { error: team2Error } = await supabaseBrowser
          .from("match_players")
          .insert(team2Records);

        if (team2Error) throw team2Error;
      }

      setIsEditing(false);
      setPlayerCouples([]);
      setAutoBalanceStatus("idle");
      setLastSolution(null);
      setIsBestBalance(false);

      // Refresh players in match
      const { data: matchPlayers } = await supabaseBrowser
        .from("match_players")
        .select(
          `
          *,
          player:profiles(id, full_name, avatar_url, email)
        `
        )
        .eq("match_id", match.id);

      onUpdate(matchPlayers || []);

      if (onAvailabilityUpdate) {
        await onAvailabilityUpdate();
      }
      
      setManuallyAddedPlayers([]);

      toast.success("Team assignments saved successfully");

      // Send push notification only if both teams have players
      if (team1Players.length > 0 && team2Players.length > 0) {
        fetch("/api/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "teams_published",
            title: "Teams Announced",
            body: `Team assignments for the match have been published`,
            url: `/matches/${match.id}`,
          }),
        }).catch(() => {});
      }
    } catch (error) {
      console.error("Error saving teams:", error);
      toast.error("Failed to save team assignments");
    } finally {
      setIsSubmittingTeams(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle>Teams</CardTitle>
          {userRole === "admin" && isUpcoming && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="w-full sm:w-auto"
            >
              {isEditing ? (
                <>Cancel</>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Teams
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            <Tabs
              value={teamAssignmentMode}
              onValueChange={setTeamAssignmentMode}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="add-players">
                  <UserPlus className="h-4 w-4 mr-2 hidden sm:inline" />
                  Add Players
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <Users className="h-4 w-4 mr-2 hidden sm:inline" />
                  Manual
                </TabsTrigger>
                <TabsTrigger value="auto-balance">
                  <RefreshCw className="h-4 w-4 mr-2 hidden sm:inline" />
                  Auto Balance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add-players" className="pt-4">
                <ManualPlayerSelection
                  matchId={match.id}
                  manuallyAddedPlayers={manuallyAddedPlayers}
                  playersInMatch={playersInMatch}
                  availability={availability}
                  onPlayersUpdate={handleManualPlayersUpdate}
                />
              </TabsContent>

              <TabsContent value="manual" className="pt-4">
                <div className="space-y-6">
                  <AvailablePlayersList
                    availablePlayers={availablePlayers}
                    addPlayerToTeam={addPlayerToTeam}
                  />

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <TeamPlayersList
                      players={team1Players}
                      teamNumber={1}
                      removePlayerFromTeam={removePlayerFromTeam}
                      isEditing={true}
                    />

                    <TeamPlayersList
                      players={team2Players}
                      teamNumber={2}
                      removePlayerFromTeam={removePlayerFromTeam}
                      isEditing={true}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="auto-balance" className="pt-4">
                <div className="space-y-6">
                  <PlayerCouplesManager
                    playerCouples={playerCouples}
                    availability={getAllAvailablePlayers().map((player) => ({
                      player,
                      status: "available",
                    }))}
                    team1Players={team1Players}
                    team2Players={team2Players}
                    availablePlayers={availablePlayers}
                    addPlayerCouple={addPlayerCouple}
                    updatePlayerCouple={updatePlayerCouple}
                    removePlayerCouple={removePlayerCouple}
                    autoBalanceTeams={autoBalanceTeams}
                    autoBalanceByWinRate={autoBalanceByWinRate}
                    autoBalanceStatus={autoBalanceStatus}
                  />

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <TeamPlayersList
                      players={team1Players}
                      teamNumber={1}
                      isEditing={false}
                      isBestBalance={isBestBalance}
                    />

                    <TeamPlayersList
                      players={team2Players}
                      teamNumber={2}
                      isEditing={false}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleSaveTeams}
                disabled={isSubmittingTeams}
                className="w-full sm:w-auto"
              >
                {isSubmittingTeams ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Teams
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TeamDisplay teamNumber={1} playersInMatch={playersInMatch} />

            <TeamDisplay teamNumber={2} playersInMatch={playersInMatch} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
