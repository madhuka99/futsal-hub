"use client";
import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { UpcomingMatches } from "@/components/dashboard/UpcomingMatches";
import { RecentResults } from "@/components/dashboard/RecentResults";
import { NextMatchAvailability } from "@/components/dashboard/NextMatchAvailability";
import { TopPlayersCard } from "@/components/dashboard/TopPlayersCard";

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    upcomingMatches: 0,
    winRate: 0,
  });
  const [topPlayers, setTopPlayers] = useState({
    winrate: [],
    matches: [],
    goals: [],
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [availabilityStats, setAvailabilityStats] = useState({
    available: 0,
    notAvailable: 0,
    maybe: 0,
    notResponded: 0,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        await Promise.all([
          fetchStats(),
          fetchTopPlayers(),
          fetchRecentMatches(),
          fetchUpcomingMatches(),
          fetchCurrentUser(),
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  async function fetchStats() {
    try {
      // Total players
      const { count: playerCount } = await supabaseBrowser
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Total matches
      const { count: matchCount } = await supabaseBrowser
        .from("matches")
        .select("*", { count: "exact", head: true });

      // Get upcoming matches count using score-based logic
      // Matches without scores are considered upcoming
      const { count: upcomingCount } = await supabaseBrowser
        .from("matches")
        .select("*", { count: "exact", head: true })
        .is("team1_score", null)
        .is("team2_score", null);

      // Calculate win rate for current user
      let winRate = 0;
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (user) {
        // Get user statistics from the view
        const { data: userStats } = await supabaseBrowser
          .from("player_statistics")
          .select("win_percentage")
          .eq("id", user.id)
          .single();

        if (userStats) {
          winRate = userStats.win_percentage || 0;
        }
      }

      setStats({
        totalPlayers: playerCount || 0,
        totalMatches: matchCount || 0,
        upcomingMatches: upcomingCount || 0,
        winRate,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  async function fetchTopPlayers() {
    try {
      // Fetch top players by goals - all time highest goal scorers
      const { data: topGoalScorers } = await supabaseBrowser
        .from("player_statistics")
        .select("*")
        .order("total_goals", { ascending: false })
        .limit(5);

      // Fetch top players by Matches
      const { data: topMatches } = await supabaseBrowser
        .from("player_statistics")
        .select("*")
        .order("matches_played", { ascending: false })
        .limit(5);

      // Fetch top players by Win Rate
      const { data: topWinRate } = await supabaseBrowser
        .from("player_statistics")
        .select("*")
        .gte("matches_played", 10)
        .order("win_percentage", { ascending: false })
        .limit(5);

      setTopPlayers({
        winrate: topWinRate || [],
        matches: topMatches || [],
        goals: topGoalScorers || [],
      });
    } catch (error) {
      console.error("Error fetching top players:", error);
    }
  }

  async function fetchRecentMatches() {
    try {
      // Fetch matches with scores (completed matches) from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

      const { data: recentMatches } = await supabaseBrowser
        .from("matches")
        .select(
          `
        id, 
        date, 
        startTime,
        endTime, 
        location, 
        team1_score, 
        team2_score,
        created_by
      `
        )
        .gte("date", thirtyDaysAgoStr)
        .not("team1_score", "is", null)
        .not("team2_score", "is", null)
        .order("date", { ascending: false })
        .order("startTime", { ascending: false })
        .limit(5);

      setRecentMatches(recentMatches || []);
    } catch (error) {
      console.error("Error fetching recent matches:", error);
    }
  }

  async function fetchUpcomingMatches() {
    try {
      // Fetch matches without scores (upcoming matches)
      // Order by date and time to get the next matches
      const { data: matches } = await supabaseBrowser
        .from("matches")
        .select(
          `
        id, 
        date, 
        startTime, 
        endTime,
        location
      `
        )
        .is("team1_score", null)
        .is("team2_score", null)
        .order("date", { ascending: true })
        .order("startTime", { ascending: true })
        .limit(3);

      const upcomingMatches = matches || [];

      // For the next match, fetch availability stats
      if (upcomingMatches && upcomingMatches.length > 0) {
        const nextMatchId = upcomingMatches[0].id;

        const { data: availabilityData } = await supabaseBrowser
          .from("availability")
          .select("status")
          .eq("match_id", nextMatchId);

        if (availabilityData) {
          const available = availabilityData.filter(
            (a) => a.status === "available"
          ).length;
          const notAvailable = availabilityData.filter(
            (a) => a.status === "not available"
          ).length;
          const maybe = availabilityData.filter(
            (a) => a.status === "maybe"
          ).length;

          // Get total players
          const { count: totalPlayers } = await supabaseBrowser
            .from("profiles")
            .select("*", { count: "exact", head: true });

          const notResponded =
            (totalPlayers || 0) - (available + notAvailable + maybe);

          setAvailabilityStats({
            available,
            notAvailable,
            maybe,
            notResponded: notResponded > 0 ? notResponded : 0,
          });
        }
      }

      setUpcomingMatches(upcomingMatches);
    } catch (error) {
      console.error("Error fetching upcoming matches:", error);
    }
  }

  async function fetchCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (user) {
        const { data } = await supabaseBrowser
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <DashboardHeader currentUser={currentUser} />
      <StatCards stats={stats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2">
          <UpcomingMatches matches={upcomingMatches} />
          <RecentResults matches={recentMatches} />
        </div>

        {/* Right Column */}
        <div>
          {upcomingMatches.length > 0 && (
            <NextMatchAvailability
              match={upcomingMatches[0]}
              stats={stats}
              availabilityStats={availabilityStats}
            />
          )}
          <TopPlayersCard players={topPlayers} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
