// Main StatsPage component
"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { toast } from "sonner";
import { BarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Import sub-components
import { PlayerInfoCard } from "@/components/stats/PlayerInfoCard";
import { StatsGrid } from "@/components/stats/StatsGrid";
import { MatchResultsChart } from "@/components/stats/MatchResultsChart";
import { AttendanceChart } from "@/components/stats/AttendanceChart";
import { WinRatePieChart } from "@/components/stats/WinRatePieChart";
import { RecentMatches } from "@/components/stats/RecentMatches";

export default function StatsPage() {
  const [playerStats, setPlayerStats] = useState(null);
  const [user, setUser] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [allMatchesWithAttendance, setAllMatchesWithAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const {
          data: { user: currentUser },
        } = await supabaseBrowser.auth.getUser();

        if (!currentUser) {
          toast.error("Please log in to view your stats");
          return;
        }

        setUser(currentUser);

        // Get player profile with stats from player_statistics view
        const { data: profile, error: profileError } = await supabaseBrowser
          .from("player_statistics")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (profileError) {
          // If no stats exist yet (new user), create a default stats object
          if (profileError.code === "PGRST116") {
            // Get basic profile info
            const { data: basicProfile } = await supabaseBrowser
              .from("profiles")
              .select("*")
              .eq("id", currentUser.id)
              .single();

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

        // Get recent matches - fetch all and sort in JavaScript
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
          .eq("user_id", currentUser.id);

        if (matchError) throw matchError;

        // Sort by match date in JavaScript
        const sortedMatches = (matchHistory || [])
          .filter((item) => item.match) // Filter out any null matches
          .sort((a, b) => {
            // First try to sort by match date
            const dateA = new Date(a.match.date);
            const dateB = new Date(b.match.date);

            if (dateA.getTime() !== dateB.getTime()) {
              return dateB - dateA; // Most recent first
            }

            // If dates are the same, sort by created_at
            const createdA = new Date(a.match.created_at || 0);
            const createdB = new Date(b.match.created_at || 0);
            return createdB - createdA;
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
          user_id: currentUser.id,
          team_number: null,
          attended: participatedMatchIds.has(match.id),
        }));

        setAllMatchesWithAttendance(matchesWithAttendance);
      } catch (error) {
        console.error("Error fetching player stats:", error);
        toast.error("Failed to load player statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerStats();
  }, []);

  // Calculate derived statistics
  const calculateStats = () => {
    if (!playerStats) return {};

    const {
      matches_played = 0,
      wins = 0,
      losses = 0,
      total_goals = 0,
      total_assists = 0,
      mvp_count = 0,
      draws = 0,
      win_percentage = 0,
      goals_per_match = 0,
    } = playerStats;

    const assistsPerMatch =
      matches_played > 0 ? total_assists / matches_played : 0;
    const mvpRate = matches_played > 0 ? (mvp_count / matches_played) * 100 : 0;

    return {
      draws,
      winRate: win_percentage,
      goalsPerMatch: goals_per_match,
      assistsPerMatch,
      mvpRate,
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">My Statistics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!playerStats) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h2 className="text-xl font-semibold mb-4">
          Unable to load statistics
        </h2>
        <p className="text-muted-foreground">
          Please try again later or contact support if the issue persists.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight">My Statistics</h1>
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
