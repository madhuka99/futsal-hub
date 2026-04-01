// components/matches/detail/match-stats-section.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsEditor from "./stats-editor";
import MvpVoter from "./mvp-voter";

export default function MatchStatsSection({
  match,
  playersInMatch,
  userId,
  isUpcoming,
  onUpdate,
}) {
  return (
    <div className="space-y-6">
      {/* Player Statistics Editor */}
      <StatsEditor
        match={match}
        playersInMatch={playersInMatch}
        userId={userId}
        isUpcoming={isUpcoming}
        onUpdate={onUpdate}
      />

      {/* MVP Voting System */}
      <MvpVoter
        match={match}
        playersInMatch={playersInMatch}
        userId={userId}
        isUpcoming={isUpcoming}
        onUpdate={onUpdate}
      />
    </div>
  );
}
