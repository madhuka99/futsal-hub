// RecentResults.jsx
"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaChevronRight } from "react-icons/fa";

export function RecentResults({ matches }) {
  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Recent Results</CardTitle>
          <Link href="/matches" passHref>
            <Button variant="ghost" className="h-8 text-sm">
              View all
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-2 md:px-6">
        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex flex-col space-y-2 p-4 rounded-lg border border-border"
              >
                <div className="mr-3 text-sm text-muted-foreground">
                  {formatDate(match.date)}
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex-1 flex justify-center items-center">
                    <div className="flex items-center justify-end flex-1 mr-2">
                      <span className="font-semibold">Team 1</span>
                    </div>
                    <div className="flex items-center justify-center bg-muted px-3 py-1 rounded-lg">
                      <span
                        className={`text-lg font-bold ${
                          match.team1_score > match.team2_score
                            ? "text-primary"
                            : ""
                        }`}
                      >
                        {match.team1_score}
                      </span>
                      <span className="mx-1 text-muted-foreground">-</span>
                      <span
                        className={`text-lg font-bold ${
                          match.team2_score > match.team1_score
                            ? "text-primary"
                            : ""
                        }`}
                      >
                        {match.team2_score}
                      </span>
                    </div>
                    <div className="flex items-center justify-start flex-1 ml-2">
                      <span className="font-semibold">Team 2</span>
                    </div>
                  </div>
                  <div className="ml-2">
                    <Link href={`/matches/${match.id}`} passHref>
                      <FaChevronRight />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No recent match results
          </div>
        )}
      </CardContent>
    </Card>
  );
}
