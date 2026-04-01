// components/matches/detail/mvp-voting/mvp-voter.jsx
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Trophy, Medal } from "lucide-react";
import { toast } from "sonner";
import { supabaseBrowser } from "@/utils/supabase/client";

export default function MvpVoter({
  match,
  playersInMatch,
  userId,
  onUpdate,
  isUpcoming,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [currentVote, setCurrentVote] = useState(null);
  const [votingResults, setVotingResults] = useState(null);
  const [isLoadingVotes, setIsLoadingVotes] = useState(true);
  const [mvpPlayer, setMvpPlayer] = useState(null);

  // Exclude the current user from the voting options
  const eligiblePlayers = playersInMatch.filter((p) => p.user_id !== userId);

  // Check if the current user played in this match
  const userPlayedInMatch = playersInMatch.some((p) => p.user_id === userId);

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

  // Load existing vote and voting results
  useEffect(() => {
    const loadVotingData = async () => {
      try {
        setIsLoadingVotes(true);

        // Get current user's vote
        if (userId) {
          const { data: voteData, error: voteError } = await supabaseBrowser
            .from("mvp_votes")
            .select("*")
            .eq("match_id", match.id)
            .eq("voter_id", userId)
            .single();

          if (!voteError && voteData) {
            setCurrentVote(voteData);
            setSelectedPlayerId(voteData.voted_player_id);
          }
        }

        // Get all votes for this match
        const { data: allVotes, error: allVotesError } = await supabaseBrowser
          .from("mvp_votes")
          .select(
            `
            voted_player_id,
            voter:profiles!voter_id(full_name),
            voted_player:profiles!voted_player_id(full_name, avatar_url)
          `
          )
          .eq("match_id", match.id);

        if (allVotesError) throw allVotesError;

        // Count votes for each player
        const voteCount = {};
        allVotes.forEach((vote) => {
          if (!voteCount[vote.voted_player_id]) {
            voteCount[vote.voted_player_id] = {
              count: 0,
              playerName: vote.voted_player.full_name,
              avatarUrl: vote.voted_player.avatar_url,
            };
          }
          voteCount[vote.voted_player_id].count += 1;
        });

        // Convert to array and sort by vote count
        const votingResultsArray = Object.keys(voteCount)
          .map((playerId) => ({
            playerId,
            ...voteCount[playerId],
          }))
          .sort((a, b) => b.count - a.count);

        setVotingResults(votingResultsArray);

        // Check if there's an MVP set for this match
        const mvpPlayerData = playersInMatch.find((p) => p.is_mvp);
        if (mvpPlayerData) {
          // Get the MVP's profile stats from player_statistics view
          const { data: playerStats, error: statsError } = await supabaseBrowser
            .from("player_statistics")
            .select("mvp_count")
            .eq("id", mvpPlayerData.user_id)
            .single();

          if (!statsError && playerStats) {
            setMvpPlayer({
              ...mvpPlayerData,
              player: {
                ...mvpPlayerData.player,
                mvp_count: playerStats.mvp_count,
              },
            });
          } else {
            // Fallback if stats not available yet
            setMvpPlayer({
              ...mvpPlayerData,
              player: {
                ...mvpPlayerData.player,
                mvp_count: 0,
              },
            });
          }
        } else if (votingResultsArray.length > 0) {
          // Find the player with the most votes
          const topVotedPlayerId = votingResultsArray[0].playerId;
          const topVotedPlayerInMatch = playersInMatch.find(
            (p) => p.user_id === topVotedPlayerId
          );

          if (topVotedPlayerInMatch) {
            setMvpPlayer(topVotedPlayerInMatch);
          }
        }
      } catch (error) {
        console.error("Error loading voting data:", error);
        toast.error("Failed to load voting data");
      } finally {
        setIsLoadingVotes(false);
      }
    };

    if (match?.id && !isUpcoming) {
      loadVotingData();
    } else {
      setIsLoadingVotes(false);
    }
  }, [match?.id, userId, isUpcoming, playersInMatch]);

  // Submit MVP vote
  const handleSubmitVote = async () => {
    if (!selectedPlayerId) {
      toast.error("Please select a player to vote for");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user already voted
      if (currentVote) {
        // Update existing vote
        const { error } = await supabaseBrowser
          .from("mvp_votes")
          .update({
            voted_player_id: selectedPlayerId,
            voted_at: new Date().toISOString(),
          })
          .eq("id", currentVote.id);

        if (error) throw error;
      } else {
        // Insert new vote
        const { error } = await supabaseBrowser.from("mvp_votes").insert({
          match_id: match.id,
          voter_id: userId,
          voted_player_id: selectedPlayerId,
        });

        if (error) throw error;
      }

      // Refresh voting data to get updated vote counts
      const { data: allVotes, error: allVotesError } = await supabaseBrowser
        .from("mvp_votes")
        .select("voted_player_id")
        .eq("match_id", match.id);

      if (allVotesError) throw allVotesError;

      // Count votes for each player
      const voteCount = {};
      allVotes.forEach((vote) => {
        voteCount[vote.voted_player_id] =
          (voteCount[vote.voted_player_id] || 0) + 1;
      });

      // Find player with most votes
      let topVotedPlayerId = null;
      let maxVotes = 0;

      Object.entries(voteCount).forEach(([playerId, votes]) => {
        if (votes > maxVotes) {
          maxVotes = votes;
          topVotedPlayerId = playerId;
        }
      });

      // Update MVP status in match_players table ONLY
      if (topVotedPlayerId) {
        // Remove MVP status from all players in this match
        await supabaseBrowser
          .from("match_players")
          .update({ is_mvp: false })
          .eq("match_id", match.id);

        // Set MVP status for the top voted player
        await supabaseBrowser
          .from("match_players")
          .update({ is_mvp: true })
          .eq("match_id", match.id)
          .eq("user_id", topVotedPlayerId);
      }

      // Refresh voting results display
      const { data: refreshedVotes, error: refreshError } =
        await supabaseBrowser
          .from("mvp_votes")
          .select(
            `
          voted_player_id,
          voter:profiles!voter_id(full_name),
          voted_player:profiles!voted_player_id(full_name, avatar_url)
        `
          )
          .eq("match_id", match.id);

      if (!refreshError && refreshedVotes) {
        // Update voting results
        const refreshedVoteCount = {};
        refreshedVotes.forEach((vote) => {
          if (!refreshedVoteCount[vote.voted_player_id]) {
            refreshedVoteCount[vote.voted_player_id] = {
              count: 0,
              playerName: vote.voted_player.full_name,
              avatarUrl: vote.voted_player.avatar_url,
            };
          }
          refreshedVoteCount[vote.voted_player_id].count += 1;
        });

        const refreshedVotingResults = Object.keys(refreshedVoteCount)
          .map((playerId) => ({
            playerId,
            ...refreshedVoteCount[playerId],
          }))
          .sort((a, b) => b.count - a.count);

        setVotingResults(refreshedVotingResults);
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

      // Find the MVP player and get their stats from player_statistics view
      const updatedMvpPlayer = updatedPlayers.find((p) => p.is_mvp);
      if (updatedMvpPlayer) {
        // Get MVP count from player_statistics view
        const { data: mvpStats } = await supabaseBrowser
          .from("player_statistics")
          .select("mvp_count")
          .eq("id", updatedMvpPlayer.user_id)
          .single();

        setMvpPlayer({
          ...updatedMvpPlayer,
          player: {
            ...updatedMvpPlayer.player,
            mvp_count: mvpStats?.mvp_count || 0,
          },
        });
      }

      // Call the onUpdate callback to refresh the parent component
      onUpdate(updatedPlayers || []);

      setCurrentVote({
        voted_player_id: selectedPlayerId,
      });

      toast.success("Your MVP vote has been recorded");
    } catch (error) {
      console.error("Error submitting MVP vote:", error);
      toast.error("Failed to submit your vote");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUpcoming) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MVP Voting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            MVP voting will be available after the match has been played.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingVotes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MVP Voting</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading voting data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MVP Voting</CardTitle>
        {userPlayedInMatch ? (
          <CardDescription>
            Vote for the player who you think performed the best in this match
          </CardDescription>
        ) : (
          <CardDescription>
            Only players who participated in this match can vote
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {mvpPlayer && (
          <div className="mb-6 overflow-hidden border rounded-lg shadow-sm">
            <div className="px-4 py-3 bg-muted border-b flex items-center">
              <Trophy className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              <h3 className="font-semibold">Match MVP</h3>
            </div>

            <div className="p-4">
              <div className="flex items-center">
                <div className="relative mr-4">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarImage
                      src={mvpPlayer.player?.avatar_url}
                      alt={mvpPlayer.player?.full_name}
                    />
                    <AvatarFallback className="text-lg bg-secondary text-secondary-foreground">
                      {getInitials(mvpPlayer.player?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-background">
                    <Trophy className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg">
                    {mvpPlayer.player?.full_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Team {mvpPlayer.team_number}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-3 rounded-md border text-center">
                  <p className="text-xs text-muted-foreground">Goals</p>
                  <p className="text-xl font-semibold">
                    {mvpPlayer.goals || 0}
                  </p>
                </div>
                <div className="p-3 rounded-md border text-center">
                  <p className="text-xs text-muted-foreground">Assists</p>
                  <p className="text-xl font-semibold">
                    {mvpPlayer.assists || 0}
                  </p>
                </div>
                <div className="p-3 rounded-md border text-center">
                  <p className="text-xs text-muted-foreground">Votes</p>
                  <p className="text-xl font-semibold">
                    {votingResults?.find(
                      (r) => r.playerId === mvpPlayer.user_id
                    )?.count || 0}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-center bg-secondary py-2 px-4 rounded-md text-secondary-foreground">
                {mvpPlayer.player?.full_name} has been{" "}
                {mvpPlayer.player?.mvp_count > 1
                  ? `MVP ${mvpPlayer.player?.mvp_count} times`
                  : "MVP for the first time"}
                !
              </div>
            </div>
          </div>
        )}

        {userPlayedInMatch ? (
          <>
            <div className="space-y-4">
              <RadioGroup
                value={selectedPlayerId}
                onValueChange={setSelectedPlayerId}
                className="space-y-2"
              >
                {eligiblePlayers.map((player) => (
                  <div
                    key={player.user_id}
                    className="flex items-center space-x-2 rounded-md border p-3"
                  >
                    <RadioGroupItem
                      value={player.user_id}
                      id={`player-${player.user_id}`}
                    />
                    <Label
                      htmlFor={`player-${player.user_id}`}
                      className="flex items-center flex-1 cursor-pointer"
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage
                          src={player.player?.avatar_url}
                          alt={player.player?.full_name}
                        />
                        <AvatarFallback>
                          {getInitials(player.player?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {player.player?.full_name}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button
                onClick={handleSubmitVote}
                disabled={isSubmitting || !selectedPlayerId}
                className="w-full mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>{currentVote ? "Update Vote" : "Submit Vote"}</>
                )}
              </Button>
            </div>

            {currentVote && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                You have already voted. You can change your vote if you want.
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            You did not participate in this match and cannot vote for MVP.
          </div>
        )}

        {votingResults && votingResults.length > 0 && (
          <div className="mt-8">
            <h3 className="font-medium mb-3">Current Voting Results</h3>
            <div className="space-y-3">
              {votingResults.map((result, index) => (
                <div
                  key={result.playerId}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center">
                    {index === 0 && (
                      <Medal className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage
                        src={result.avatarUrl}
                        alt={result.playerName}
                      />
                      <AvatarFallback>
                        {getInitials(result.playerName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{result.playerName}</span>
                  </div>
                  <div className="bg-secondary px-3 py-1 rounded-full text-sm font-medium">
                    {result.count} {result.count === 1 ? "vote" : "votes"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
