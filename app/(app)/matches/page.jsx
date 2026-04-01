"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/utils/supabase/client";

// Import subcomponents
import { CreateMatchDialog } from "@/components/matches/create-match-dialog";
import { MatchTabs } from "@/components/matches/match-tabs";

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState({ upcoming: [], past: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState("past");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // Fetch matches and user role on component mount
  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (user) {
        const { data: profile } = await supabaseBrowser
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserRole(profile.role);
        }
      }
    };

    const fetchMatches = async () => {
      setIsLoading(true);

      // Fetch all matches (no date restriction)
      const { data: allMatches } = await supabaseBrowser
        .from("matches")
        .select(
          `
          *,
          created_by:profiles(full_name, email),
          match_players(*)
        `
        )
        .order("date", { ascending: true })
        .order("startTime", { ascending: true });

      if (allMatches) {
        // Separate matches into upcoming and past based on score availability
        // Simple logic: If match has scores, it's completed; if no scores, it's upcoming
        const upcoming = [];
        const past = [];

        allMatches.forEach((match) => {
          // Score-based logic: matches without scores are upcoming
          if (match.team1_score === null && match.team2_score === null) {
            upcoming.push(match);
          } else {
            // Matches with scores are completed/past
            past.push(match);
          }
        });

        // Sort upcoming matches by date/time (ascending - nearest first)
        upcoming.sort((a, b) => {
          const dateCompare = new Date(a.date) - new Date(b.date);
          if (dateCompare !== 0) return dateCompare;

          const timeA = a.startTime || "00:00";
          const timeB = b.startTime || "00:00";
          return timeA.localeCompare(timeB);
        });

        // Sort past matches by date/time (descending - most recent first)
        past.sort((a, b) => {
          const dateCompare = new Date(b.date) - new Date(a.date);
          if (dateCompare !== 0) return dateCompare;

          const timeA = a.startTime || "00:00";
          const timeB = b.startTime || "00:00";
          return timeB.localeCompare(timeA);
        });

        setMatches({ upcoming, past });
      }

      setIsLoading(false);
    };

    fetchUserRole();
    fetchMatches();
  }, []);

  // Navigate to match details
  const handleMatchClick = (matchId) => {
    router.push(`/matches/${matchId}`);
  };

  // Handle newly created match
  const handleMatchCreated = (newMatch) => {
    setMatches((prev) => ({
      ...prev,
      upcoming: [newMatch, ...prev.upcoming],
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
        {userRole === "admin" && (
          <CreateMatchDialog onMatchCreated={handleMatchCreated} />
        )}
      </div>

      <MatchTabs
        matches={matches}
        isLoading={isLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMatchClick={handleMatchClick}
        isAdmin={userRole === "admin"}
        onCreateMatch={() => setOpenCreateDialog(true)}
      />
    </div>
  );
}
