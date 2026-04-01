"use client";
import React from "react";

export function PlayerFilters({
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label
          htmlFor="position-filter"
          className="block text-sm font-medium mb-1 "
        >
          Position
        </label>
        <select
          id="position-filter"
          name="position"
          value={filters.position}
          onChange={onFilterChange}
          className="w-full px-3 py-2 border border-input rounded-lg bg-secondary focus:outline-none cursor-pointer"
        >
          <option value="">All positions</option>
          <option value="Forward">Forward</option>
          <option value="Midfielder">Midfielder</option>
          <option value="Defender">Defender</option>
          <option value="Goalkeeper">Goalkeeper</option>
        </select>
      </div>

      <div>
        <label htmlFor="role-filter" className="block text-sm font-medium mb-1 ">
          Role
        </label>
        <select
          id="role-filter"
          name="role"
          value={filters.role}
          onChange={onFilterChange}
          className="w-full px-3 py-2 border border-input rounded-lg bg-secondary focus:outline-none cursor-pointer"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="player">Player</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onResetFilters}
          className="px-3 py-1 text-sm cursor-pointer border border-input rounded-lg bg-background hover:bg-secondary transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onApplyFilters}
          className="px-3 py-1 text-sm cursor-pointer bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
