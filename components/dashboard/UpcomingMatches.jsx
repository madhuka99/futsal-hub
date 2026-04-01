// UpcomingMatches.jsx
"use client";
import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight, Clock, MapPin } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function UpcomingMatches({ matches }) {
  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "TBD";
    return timeString.substring(0, 5);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Upcoming Matches</CardTitle>
          <Link href="/matches" passHref>
            <Button variant="ghost" className="h-8 text-sm">
              View all
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-2 md:px-4">
        {matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block"
              >
                <div
                  className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    index === 0 ? "bg-muted" : ""
                  }`}
                >
                  <div className="bg-primary/10 rounded-lg p-3 mr-4">
                    <Calendar
                      className={`h-5 w-5 ${
                        index === 0 ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{formatDate(match.date)}</h4>
                      {index === 0 && <Badge>Next Match</Badge>}
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                      <Clock size={14} className="mr-1" />
                      <span className="mr-4">
                        {formatTime(match.startTime)}
                      </span>
                      <MapPin size={14} className="mr-1" />
                      <span>{match.location || "TBD"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No upcoming matches scheduled
          </div>
        )}
      </CardContent>
    </Card>
  );
}
