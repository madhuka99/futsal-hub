// app/(app)/player/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/utils/supabase/client";
import { toast } from "sonner";
import { BarChart, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import sub-components from stats page
import { PlayerInfoCard } from "@/components/stats/PlayerInfoCard";
import { StatsGrid } from "@/components/stats/StatsGrid";
import { MatchResultsChart } from "@/components/stats/MatchResultsChart";
import { AttendanceChart } from "@/components/stats/AttendanceChart";
import { WinRatePieChart } from "@/components/stats/WinRatePieChart";
import { RecentMatches } from "@/components/stats/RecentMatches";

export default function PlayerStatsPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id;

  const [playerStats, setPlayerStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [allMatchesWithAttendance, setAllMatchesWithAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get player profile with stats from player_statistics view
        const { data: profile, error: profileError } = await supabaseBrowser
          .from("player_statistics")
          .select("*")
          .eq("id", playerId)
          .single();

        if (profileError) {
          // If no stats exist yet, try to get basic profile info
          if (profileError.code === "PGRST116") {
            const { data: basicProfile, error: basicError } =
              await supabaseBrowser
                .from("profiles")
                .select("*")
                .eq("id", playerId)
                .single();

            if (basicError) {
              throw new Error("Player not found");
            }

            if (basicProfile) {
              setPlayerStats({
                ...basicProfile,
                matches_played: 0,
                total_goals: 0,
                total_assists: 0,
                mvp_count: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                goals_per_match: 0,
                win_percentage: 0,
              });
            }
          } else {
            throw profileError;
          }
        } else {
          setPlayerStats(profile);
        }

        // Get recent matches for this player
        const { data: matchHistory, error: matchError } = await supabaseBrowser
          .from("match_players")
          .select(
            `
            *,
            match:matches(
              id,
              date,
              location,
              team1_score,
              team2_score,
              created_at
            )
          `
          )
          .eq("user_id", playerId);

        if (matchError) throw matchError;

        // Sort matches by date (most recent first)
        const sortedMatches = (matchHistory || []).sort((a, b) => {
          return new Date(b.match.date) - new Date(a.match.date);
        });

        setRecentMatches(sortedMatches);

        // Fetch ALL matches for attendance tracking
        const { data: allMatches, error: allMatchesError } = await supabaseBrowser
          .from("matches")
          .select("id, date, location, team1_score, team2_score, created_at")
          .order("date", { ascending: false });

        if (allMatchesError) throw allMatchesError;

        // Create a Set of match IDs the player participated in
        const participatedMatchIds = new Set(
          (matchHistory || []).map((mp) => mp.match_id)
        );

        // Map all matches with attendance status
        const matchesWithAttendance = (allMatches || []).map((match) => ({
          match: match,
          match_id: match.id,
          user_id: playerId,
          team_number: null,
          attended: participatedMatchIds.has(match.id),
        }));

        setAllMatchesWithAttendance(matchesWithAttendance);
      } catch (err) {
        console.error("Error fetching player stats:", err);
        setError(err.message || "Failed to load player statistics");
        toast.error("Failed to load player statistics");
      } finally {
        setIsLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerStats();
    }
  }, [playerId]);

  // Calculate derived stats (same logic as stats page)
  const stats = {
    goalsPerMatch:
      playerStats?.matches_played > 0
        ? (playerStats.total_goals || 0) / playerStats.matches_played
        : 0,
    assistsPerMatch:
      playerStats?.matches_played > 0
        ? (playerStats.total_assists || 0) / playerStats.matches_played
        : 0,
    mvpRate:
      playerStats?.matches_played > 0
        ? ((playerStats.mvp_count || 0) / playerStats.matches_played) * 100
        : 0,
    winRate: playerStats?.win_percentage || 0,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
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

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Player not found
  if (!playerStats) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Player not found</h2>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Players
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">
          {playerStats.full_name}'s Statistics
        </h1>
      </div>

      {/* Player Info Card */}
      <PlayerInfoCard playerStats={playerStats} />

      {/* Main Stats Grid */}
      <StatsGrid playerStats={playerStats} stats={stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Results Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <MatchResultsChart
            recentMatches={recentMatches}
            currentWinRate={stats.winRate || 0}
          />
        </div>

        {/* Win Rate Pie Chart - Takes 1 column */}
        <div className="lg:col-span-1">
          <WinRatePieChart playerStats={playerStats} />
        </div>
      </div>

      {/* Attendance Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AttendanceChart allMatches={allMatchesWithAttendance} />
        </div>
      </div>

      {/* Recent Matches */}
      <RecentMatches recentMatches={recentMatches.slice(0, 10)} />
    </div>
  );
}
