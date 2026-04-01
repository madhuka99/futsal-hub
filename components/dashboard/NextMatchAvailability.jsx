// NextMatchAvailability.jsx
"use client";
import React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function NextMatchAvailability({ match, stats, availabilityStats }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (!match) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Next Match Availability</CardTitle>
        <CardDescription>{formatDate(match.date)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Available</span>
            <span className="text-sm text-muted-foreground">
              {availabilityStats.available} players
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Maybe</span>
            <span className="text-sm text-muted-foreground">
              {availabilityStats.maybe} players
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Not Available</span>
            <span className="text-sm text-muted-foreground">
              {availabilityStats.notAvailable} players
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Not Responded</span>
            <span className="text-sm text-muted-foreground">
              {availabilityStats.notResponded} players
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/matches/${match.id}`} passHref className="w-full">
          <Button className="w-full">Update My Availability</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
