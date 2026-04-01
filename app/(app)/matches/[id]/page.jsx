"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseISO } from "date-fns";
import { ArrowLeft, Share2, Image, Type, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/utils/supabase/client";

// shadcn components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateMatchImage } from "@/lib/generate-match-image";

// Match detail components
import MatchDetailsCard from "@/components/matches/detail/match-details-card";
import TeamsManagement from "@/components/matches/detail/teams-management";
import AvailabilitySection from "@/components/matches/detail/availability-section";
import MatchStatsSection from "@/components/matches/detail/match-stats-section";

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [match, setMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playersInMatch, setPlayersInMatch] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Fetch availability data separately to allow for refreshing
  const fetchAvailabilityData = async () => {
    try {
      const { data: availabilityData } = await supabaseBrowser
        .from("availability")
        .select(
          `
          *,
          player:profiles(id, full_name, avatar_url, email)
        `
        )
        .eq("match_id", params.id);

      setAvailability(availabilityData || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  // Fetch match data and user info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Get current user
        const {
          data: { user },
        } = await supabaseBrowser.auth.getUser();

        if (user) {
          setUserId(user.id);

          // Get user role
          const { data: profile } = await supabaseBrowser
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profile) {
            setUserRole(profile.role);
          }
        }

        // Get match data
        const { data: matchData, error: matchError } = await supabaseBrowser
          .from("matches")
          .select(
            `
            *,
            created_by:profiles(full_name, email)
          `
          )
          .eq("id", params.id)
          .single();

        if (matchError) throw matchError;

        setMatch(matchData);

        // Get all players
        const { data: allPlayers } = await supabaseBrowser
          .from("profiles")
          .select("*")
          .order("full_name");

        setPlayers(allPlayers || []);

        // Get players in this match
        const { data: matchPlayers } = await supabaseBrowser
          .from("match_players")
          .select(
            `
            *,
            player:profiles(id, full_name, avatar_url, email)
          `
          )
          .eq("match_id", params.id);

        setPlayersInMatch(matchPlayers || []);

        // Get availability for this match
        await fetchAvailabilityData();

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load match data");

        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  // Go back to matches list
  const handleBack = () => {
    router.push("/matches");
  };

  // Delete match
  const handleDeleteMatch = async () => {
    try {
      const { error } = await supabaseBrowser
        .from("matches")
        .delete()
        .eq("id", match.id);

      if (error) throw error;

      toast.success("Match deleted successfully");

      // Send push notification about cancellation
      fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "match_cancelled",
          title: "Match Cancelled",
          body: `A match has been cancelled`,
          url: "/matches",
        }),
      }).catch(() => {});

      router.push("/matches");
    } catch (error) {
      console.error("Error deleting match:", error);
      toast.error("Failed to delete match");
    }
  };

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Build share text with player list
  const buildShareText = () => {
    const matchDate = parseISO(match.date);
    const dateStr = matchDate.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeStr = match.startTime ? match.startTime.substring(0, 5) : "";
    const matchHasScores =
      match.team1_score !== null && match.team2_score !== null;

    let text = `Futsal Match\n${dateStr}${timeStr ? ` at ${timeStr}` : ""}`;
    if (match.location) text += `\nLocation: ${match.location}`;
    if (matchHasScores)
      text += `\nScore: Team A ${match.team1_score} - ${match.team2_score} Team B`;

    // Include player lists
    const team1 = playersInMatch.filter((p) => p.team_number === 1);
    const team2 = playersInMatch.filter((p) => p.team_number === 2);
    if (team1.length > 0 || team2.length > 0) {
      text += "\n";
      if (team1.length > 0) {
        text += `\nTeam A: ${team1.map((p) => p.player?.full_name || "Unknown").join(", ")}`;
      }
      if (team2.length > 0) {
        text += `\nTeam B: ${team2.map((p) => p.player?.full_name || "Unknown").join(", ")}`;
      }
    }

    // CTA for upcoming matches
    const matchDateObj = new Date(matchDate);
    if (match.startTime) {
      const [h, m, s] = match.startTime.split(":").map(Number);
      matchDateObj.setHours(h || 0, m || 0, s || 0);
    }
    if (matchDateObj > new Date()) {
      text += `\n\nAre you available? Tap to respond!`;
    }

    const url = `${window.location.origin}/matches/${match.id}`;
    text += `\n${url}`;
    return text;
  };

  // Share as text
  const handleShareText = async () => {
    const text = buildShareText();

    if (navigator.share) {
      try {
        await navigator.share({ title: "Futsal Match", text });
      } catch (err) {
        if (err.name !== "AbortError") console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Match details copied to clipboard");
      } catch {
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  // Share as image
  const handleShareImage = async () => {
    setIsGeneratingImage(true);
    try {
      const matchUrl = `${window.location.origin}/matches/${match.id}`;
      const blob = await generateMatchImage({ match, playersInMatch });
      const file = new File([blob], "match.png", { type: "image/png" });

      // Build caption text for clipboard
      const matchDateImg = parseISO(match.date);
      const dateStrImg = matchDateImg.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const timeStrImg = match.startTime ? match.startTime.substring(0, 5) : "";
      const imgHasScores = match.team1_score !== null && match.team2_score !== null;

      let shareText = `Futsal Match\n${dateStrImg}${timeStrImg ? ` at ${timeStrImg}` : ""}`;
      if (match.location) shareText += `\nLocation: ${match.location}`;
      if (imgHasScores) shareText += `\nScore: Team A  ${match.team1_score} - ${match.team2_score}  Team B`;
      shareText += `\n\n${matchUrl}`;

      // Copy caption to clipboard so user can paste it
      try {
        await navigator.clipboard.writeText(shareText);
      } catch {}

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        toast.success("Match details copied — paste as caption!", { duration: 4000 });
        await navigator.share({ files: [file] });
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "match.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Match image downloaded");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Image share failed:", err);
        toast.error("Failed to generate match image");
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Update match details
  const handleMatchUpdate = (updatedMatch) => {
    setMatch({
      ...match,
      ...updatedMatch,
    });
  };

  // Update match players
  const handlePlayersUpdate = (updatedPlayers) => {
    setPlayersInMatch(updatedPlayers);
  };

  // Update availability - enhanced to handle manual player additions
  const handleAvailabilityUpdate = async (updatedAvailability) => {
    if (Array.isArray(updatedAvailability)) {
      setAvailability(updatedAvailability);
    } else {
      // If it's a single update, refresh the entire availability data
      await fetchAvailabilityData();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Match not found</h2>
        <Button onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Matches
        </Button>
      </div>
    );
  }

  // Update this section in your MatchDetailPage component
  const matchDate = parseISO(match.date);

  // Create a combined date-time object for accurate comparison
  let matchDateTime = new Date(matchDate);

  if (match.startTime) {
    // Extract hours, minutes, seconds from the time string
    const timeComponents = match.startTime.split(":").map(Number);

    // Set the time components to the date
    matchDateTime.setHours(
      timeComponents[0] || 0,
      timeComponents[1] || 0,
      timeComponents[2] || 0
    );
  }

  // Use the current date/time for comparison
  const now = new Date();
  const isUpcoming = matchDateTime > now;

  // The rest of your code stays the same
  const matchTime = match.startTime ? parseISO(`2000-01-01T${match.startTime}`) : null;
  const hasScores = match.team1_score !== null && match.team2_score !== null;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex-1">Futsal Match</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" disabled={isGeneratingImage}>
              {isGeneratingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShareText}>
              <Type className="h-4 w-4 mr-2" />
              Share as Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareImage}>
              <Image className="h-4 w-4 mr-2" />
              Share as Image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Match details card */}
          <MatchDetailsCard
            match={match}
            isUpcoming={isUpcoming}
            userRole={userRole}
            playersInMatch={playersInMatch}
            onUpdate={handleMatchUpdate}
            showResults={showResults || hasScores}
          />
          <div className="block lg:hidden">
            <AvailabilitySection
              match={match}
              userId={userId}
              availability={availability}
              isUpcoming={isUpcoming}
              onUpdate={handleAvailabilityUpdate}
            />
          </div>
          {/* Show Teams (add players) or Stats (results) based on toggle */}
          {showResults || hasScores || !isUpcoming ? (
            <MatchStatsSection
              match={match}
              playersInMatch={playersInMatch}
              userId={userId}
              isUpcoming={false}
              onUpdate={handlePlayersUpdate}
            />
          ) : (
            <TeamsManagement
              match={match}
              playersInMatch={playersInMatch}
              availability={availability}
              isUpcoming={isUpcoming}
              userRole={userRole}
              onUpdate={handlePlayersUpdate}
              onAvailabilityUpdate={handleAvailabilityUpdate}
            />
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Availability Section */}
          <div className="hidden lg:block">
            <AvailabilitySection
              match={match}
              userId={userId}
              availability={availability}
              isUpcoming={isUpcoming}
              onUpdate={handleAvailabilityUpdate}
            />
          </div>
          {/* Admin Actions - Add Results toggle */}
          {userRole === "admin" && !hasScores && (
            <Button
              variant={showResults ? "secondary" : "default"}
              className="w-full"
              onClick={() => setShowResults(!showResults)}
            >
              {showResults ? "Back to Players" : "Add Results"}
            </Button>
          )}

          {/* Admin Actions - Delete Match */}
          {userRole === "admin" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Match
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the match and all associated data including player
                    assignments and availability.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteMatch}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
