// StatsHeader.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarRange } from "lucide-react";

export function StatsHeader({ season, onSeasonChange, seasons }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground mt-1">
          Team and player performance analytics
        </p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <CalendarRange className="text-muted-foreground h-4 w-4" />
          <span className="text-sm text-muted-foreground">Season:</span>
        </div>
        <Select value={season} onValueChange={onSeasonChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="hidden sm:flex">
          Export
        </Button>
      </div>
    </div>
  );
}
