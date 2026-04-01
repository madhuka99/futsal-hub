// components/matches/detail/match-details-card.jsx
import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  MapPin,
  Users,
  Edit,
  Save,
  Clock,
  Loader2,
} from "lucide-react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export default function MatchDetailsCard({
  match,
  isUpcoming,
  userRole,
  onUpdate,
  playersInMatch = [], // Add this prop to access players data
  showResults = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingScores, setEditingScores] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    location: match.location,
  });
  const [dateTimeData, setDateTimeData] = useState(null);
  const [team1Score, setTeam1Score] = useState(match.team1_score || 0);
  const [team2Score, setTeam2Score] = useState(match.team2_score || 0);

  // Safely parse dates for display only
  const matchDate = match.date ? parseISO(match.date) : new Date();
  const matchTime = match.startTime
    ? parseISO(`2000-01-01T${match.startTime.split(".")[0]}`)
    : null;

  // Handle date and time change from the picker
  const handleDateTimeChange = (data) => {
    setDateTimeData(data);
  };

  // Function to calculate end time (start time + 2 hours)
  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHour = (hours + 2) % 24; // Add 2 hours, handle overflow past 24
    const endMinutes = minutes;

    return `${endHour.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Update match details
  const handleSaveDetails = async () => {
    setIsSubmitting(true);
    try {
      // Check if we have date and time selected
      if (!dateTimeData || !dateTimeData.date || !dateTimeData.time) {
        toast.error("Please select a date and time for the match");
        return;
      }

      const startTime = dateTimeData.time;
      const endTime = calculateEndTime(startTime);

      const updateData = {
        location: formData.location,
        date: dateTimeData.date,
        startTime: startTime, // Save to startTime column
        endTime: endTime, // Save calculated endTime
      };

      const { error } = await supabaseBrowser
        .from("matches")
        .update(updateData)
        .eq("id", match.id);

      if (error) throw error;

      // Update local state via parent
      onUpdate(updateData);

      setIsEditing(false);
      setDateTimeData(null);

      toast.success("Match details updated successfully");
    } catch (error) {
      console.error("Error updating details:", error);
      toast.error("Failed to update match details");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update player win/loss statistics
  const updatePlayerStats = async (team1Score, team2Score) => {
    try {
      // Determine which team won
      const team1Won = team1Score > team2Score;
      const team2Won = team2Score > team1Score;
      const isDraw = team1Score === team2Score;

      // Get all players in this match
      if (playersInMatch && playersInMatch.length > 0) {
        // Separate players by team
        const team1Players = playersInMatch.filter((p) => p.team_number === 1);
        const team2Players = playersInMatch.filter((p) => p.team_number === 2);

        // Update Team 1 players
        if (team1Players.length > 0) {
          for (const player of team1Players) {
            const { data: currentProfile } = await supabaseBrowser
              .from("profiles")
              .select("wins, losses, matches_played")
              .eq("id", player.user_id)
              .single();

            if (currentProfile) {
              let updateData = {
                matches_played: (currentProfile.matches_played || 0) + 1,
              };

              if (team1Won) {
                updateData.wins = (currentProfile.wins || 0) + 1;
              } else if (team2Won) {
                updateData.losses = (currentProfile.losses || 0) + 1;
              }
              // For draws, we don't update wins or losses, only matches_played

              await supabaseBrowser
                .from("profiles")
                .update(updateData)
                .eq("id", player.user_id);
            }
          }
        }

        // Update Team 2 players
        if (team2Players.length > 0) {
          for (const player of team2Players) {
            const { data: currentProfile } = await supabaseBrowser
              .from("profiles")
              .select("wins, losses, matches_played")
              .eq("id", player.user_id)
              .single();

            if (currentProfile) {
              let updateData = {
                matches_played: (currentProfile.matches_played || 0) + 1,
              };

              if (team2Won) {
                updateData.wins = (currentProfile.wins || 0) + 1;
              } else if (team1Won) {
                updateData.losses = (currentProfile.losses || 0) + 1;
              }
              // For draws, we don't update wins or losses, only matches_played

              await supabaseBrowser
                .from("profiles")
                .update(updateData)
                .eq("id", player.user_id);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating player stats:", error);
      // Don't throw here as we still want the score update to succeed
      toast.error("Scores updated but failed to update player statistics");
    }
  };

  // Update match scores
  const handleSaveScores = async () => {
    try {
      const newTeam1Score = parseInt(team1Score) || 0;
      const newTeam2Score = parseInt(team2Score) || 0;

      const { error } = await supabaseBrowser
        .from("matches")
        .update({
          team1_score: newTeam1Score,
          team2_score: newTeam2Score,
        })
        .eq("id", match.id);

      if (error) throw error;

      setEditingScores(false);
      // Trigger refresh in parent component
      onUpdate({
        team1_score: newTeam1Score,
        team2_score: newTeam2Score,
      });
      toast.success("Match scores updated successfully");

      // Send push notification about score update
      fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "score_updated",
          title: "Match Score Updated",
          body: `Score: ${newTeam1Score} - ${newTeam2Score}`,
          url: `/matches/${match.id}`,
        }),
      }).catch(() => {});
    } catch (error) {
      console.error("Error updating scores:", error);
      toast.error("Failed to update match scores");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Match Details</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <CalendarIcon className="mr-1 h-4 w-4" />
              {format(matchDate, "PPP")}
              {matchTime && <> at {format(matchTime, "HH:mm")}</>}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isUpcoming ? (
              <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-gray-500 text-gray-500"
              >
                Past
              </Badge>
            )}

            {userRole === "admin" && isUpcoming && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>Cancel</>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g. Main Futsal Court"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="datetime" className="block text-sm font-medium">
                Date and Start Time
              </label>
              <DateTimePicker onChange={handleDateTimeChange} />
              <p className="text-xs text-muted-foreground mt-1">
                Select a new date and start time for the match (duration: 2
                hours)
              </p>
            </div>

            <Button
              onClick={handleSaveDetails}
              disabled={isSubmitting}
              className="mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Details
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Location */}
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="text-muted-foreground">{match.location}</span>
            </div>

            {/* Time */}
            {matchTime && (
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4" />
                <span className="text-muted-foreground">
                  {format(matchTime, "HH:mm")}
                  {match.endTime && ` - ${match.endTime.substring(0, 5)}`}
                </span>
              </div>
            )}

            {/* Created by */}
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4" />
              <span className="text-muted-foreground">
                Created by {match.created_by?.full_name || "Unknown"}
              </span>
            </div>
          </>
        )}

        {/* Match score section */}
        {(showResults || !isUpcoming) && (
          <div className="pt-4">
            <Separator className="mb-4" />
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Final Score</h3>
              {userRole === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingScores(!editingScores)}
                >
                  {editingScores ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              )}
            </div>

            {editingScores ? (
              <div className="mt-4">
                <div className="grid grid-cols-5 gap-4 items-center mb-4">
                  <div className="col-span-2 text-right font-medium">
                    Team 1
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={team1Score}
                      onChange={(e) => setTeam1Score(e.target.value)}
                      min="0"
                      className="text-center"
                    />
                  </div>
                  <div className="col-span-2"></div>
                </div>

                <div className="grid grid-cols-5 gap-4 items-center mb-4">
                  <div className="col-span-2 text-right font-medium">
                    Team 2
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={team2Score}
                      onChange={(e) => setTeam2Score(e.target.value)}
                      min="0"
                      className="text-center"
                    />
                  </div>
                  <div className="col-span-2"></div>
                </div>

                <Button onClick={handleSaveScores} className="mt-2">
                  <Save className="h-4 w-4 mr-2" />
                  Save Score
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Team 1</div>
                    <div className="text-3xl font-bold">{match.team1_score ?? "-"}</div>
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground">:</div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Team 2</div>
                    <div className="text-3xl font-bold">{match.team2_score ?? "-"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
