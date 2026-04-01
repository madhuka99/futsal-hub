"use client";
import React from "react";
import { Search, Filter } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { PlayerFilters } from "./PlayerFilters";
import { useMediaQuery } from "@/hooks/use-media-query";

export function PlayerSearch({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
}) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start w-full">
      <div className="relative flex-1 w-full">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-center gap-1 px-3 py-2 border border-input rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 w-full sm:w-auto">
            <Filter size={16} />
            <span>Filter Players</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align={isDesktop ? "end" : "center"}
          side="bottom"
          className="w-[300px] p-4 z-50"
        >
          {/* reuse your existing filters component */}
          <PlayerFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onApplyFilters={onApplyFilters}
            onResetFilters={onResetFilters}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
