// components/players/PlayerTable.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash,
  User,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Eye,
  ArrowUp,
  ArrowDown,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatDistanceToNow } from "date-fns";

function calculateWinPercentage(wins, losses) {
  const totalMatches = wins + losses;
  return totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
}

function formatLastLogin(timestamp) {
  if (!timestamp) return "Never";

  const date = new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true }); // e.g., "2 hours ago"
}

export function PlayerTable({
  players,
  sortField,
  sortDirection,
  onSort,
  currentUser,
  onEdit,
  onDelete,
}) {
  const router = useRouter();

  const SORT_OPTIONS = [
    { value: "full_name", label: "Name" },
    { value: "matches_played", label: "Matches" },
    { value: "wins", label: "Wins" },
    { value: "losses", label: "Losses" },
    { value: "draws", label: "Draws" },
    { value: "win_percentage", label: "Win %" },
    ...(currentUser?.role === "admin"
      ? [{ value: "last_login", label: "Last Login" }]
      : []),
  ];

  // Handle player row click to navigate to individual stats
  const handlePlayerClick = (playerId) => {
    router.push(`/player/${playerId}`);
  };

  // Mobile player card component
  const PlayerCard = ({ player }) => (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="bg-card border border-border rounded-lg p-4 mb-3 cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mr-3">
                {player.avatar_url ? (
                  <img
                    src={player.avatar_url}
                    alt={player.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-secondary-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{player.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {player.role === "admin" ? "Admin" : "Player"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {player.matches_played} matches
              </p>
              <p className="text-xs text-muted-foreground">
                {player.win_percentage}% win rate
              </p>
            </div>
          </div>
          {currentUser?.role === "admin" && (
            <>
              <div className="border-t border-border mt-3 pt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={11} />
                <span>Last login: {formatLastLogin(player.last_sign_in_at)}</span>
              </div>
            </>
          )}
        </div>
      </DrawerTrigger>

      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                {player.avatar_url ? (
                  <img
                    src={player.avatar_url}
                    alt={player.full_name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-secondary-foreground" />
                )}
              </div>
              <div>
                <DrawerTitle>{player.full_name}</DrawerTitle>
                <DrawerDescription>
                  {player.role === "admin" ? "Admin" : "Player"} •{" "}
                  {player.preferred_position || "No position"}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-muted rounded p-3">
              <p className="text-xs text-muted-foreground">Matches</p>
              <p className="text-lg font-medium">{player.matches_played}</p>
            </div>
            <div className="bg-muted rounded p-3">
              <p className="text-xs text-muted-foreground">Wins</p>
              <p className="text-lg font-medium">{player.wins}</p>
            </div>
            <div className="bg-muted rounded p-3">
              <p className="text-xs text-muted-foreground">Losses</p>
              <p className="text-lg font-medium">{player.losses}</p>
            </div>
            <div className="bg-muted rounded p-3">
              <p className="text-xs text-muted-foreground">Draws</p>
              <p className="text-lg font-medium">{player.matches_played - player.wins - player.losses}</p>
            </div>
            <div className="bg-muted rounded p-3">
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="text-lg font-medium">{player.win_percentage}%</p>
            </div>
            {currentUser?.role === "admin" && (
              <div className="bg-muted rounded p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="text-lg font-medium">
                  {formatLastLogin(player.last_sign_in_at)}
                </p>
              </div>
            )}
          </div>

          <DrawerFooter className="px-0 pt-4">
            {/* View Stats Button */}
            <Button
              variant="default"
              className="w-full mb-2"
              onClick={() => {
                document.querySelector(".drawer-close-button").click();
                handlePlayerClick(player.id);
              }}
            >
              <Eye size={16} className="mr-2" />
              View Full Stats
            </Button>

            {currentUser?.role === "admin" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    document.querySelector(".drawer-close-button").click();
                    onEdit(player);
                  }}
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    document.querySelector(".drawer-close-button").click();
                    onDelete(player.id);
                  }}
                >
                  <Trash size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            )}

            <DrawerClose asChild>
              <Button variant="outline" className="drawer-close-button">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );

  return (
    <div>
      {/* Mobile view - cards */}
      <div className="md:hidden">
        {/* Mobile sort bar */}
        <div className="flex items-center gap-2 mb-3">
          <Select value={sortField} onValueChange={(val) => onSort(val)}>
            <SelectTrigger className="flex-1">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort by..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSort(sortField)}
            className="shrink-0 gap-1.5"
            aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
          >
            {sortDirection === "asc" ? (
              <><ArrowUp size={14} /> Asc</>
            ) : (
              <><ArrowDown size={14} /> Desc</>
            )}
          </Button>
        </div>

        {players.length > 0 ? (
          <div>
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border border-border rounded-lg">
            No players found matching your criteria.
          </div>
        )}
      </div>

      {/* Desktop view - table */}
      <div className="hidden md:block overflow-x-auto border border-border rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-secondary text-secondary-foreground">
              <th
                className="px-4 py-3 text-left font-medium text-sm cursor-pointer"
                onClick={() => onSort("full_name")}
              >
                <div className="flex items-center gap-1 hover:text-primary">
                  Player
                  {sortField === "full_name" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )
                  ) : (
                    <ArrowUpDown size={14} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-sm cursor-pointer"
                onClick={() => onSort("preferred_position")}
              >
                <div className="flex items-center gap-1 hover:text-primary">
                  Position
                  {sortField === "preferred_position" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )
                  ) : (
                    <ArrowUpDown size={14} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-sm cursor-pointer"
                onClick={() => onSort("matches_played")}
              >
                <div className="flex items-center gap-1 hover:text-primary">
                  Matches
                  {sortField === "matches_played" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )
                  ) : (
                    <ArrowUpDown size={14} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-sm cursor-pointer"
                onClick={() => onSort("wins")}
              >
                <div className="flex items-center gap-1 hover:text-primary">
                  Wins
                  {sortField === "wins" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )
                  ) : (
                    <ArrowUpDown size={14} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-sm cursor-pointer"
                onClick={() => onSort("losses")}
              >
                <div className="flex items-center gap-1 hover:text-primary">
                  Losses
                  {sortField === "losses" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )
                  ) : (
                    <ArrowUpDown size={14} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-sm cursor-pointer"
                onClick={() => onSort("draws")}
              >
                <div className="flex items-center gap-1 hover:text-primary">
                  Draws
                  {sortField === "draws" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )
                  ) : (
                    <ArrowUpDown size={14} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-sm cursor-pointer"
                onClick={() => onSort("win_percentage")}
              >
                <div className="flex items-center gap-1 hover:text-primary">
                  Win %
                  {sortField === "win_percentage" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )
                  ) : (
                    <ArrowUpDown size={14} />
                  )}
                </div>
              </th>
              {currentUser?.role === "admin" && (
                <th
                  className="px-4 py-3 text-left font-medium text-sm cursor-pointer"
                  onClick={() => onSort("last_login")}
                >
                  <div className="flex items-center gap-1 hover:text-primary">
                    Last Login
                    {sortField === "last_login" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )
                    ) : (
                      <ArrowUpDown size={14} />
                    )}
                  </div>
                </th>
              )}
              {currentUser?.role === "admin" && (
                <th className="px-4 py-3 text-right font-medium text-sm">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {players.length > 0 ? (
              players.map((player) => (
                <tr
                  key={player.id}
                  className="border-t border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handlePlayerClick(player.id)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                        {player.avatar_url ? (
                          <img
                            src={player.avatar_url}
                            alt={player.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User
                            size={18}
                            className="text-secondary-foreground"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{player.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {player.role === "admin" ? "Admin" : "Player"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 capitalize">
                    {player.preferred_position || "-"}
                  </td>
                  <td className="px-4 py-4">{player.matches_played}</td>
                  <td className="px-4 py-4">{player.wins}</td>
                  <td className="px-4 py-4">{player.losses}</td>
                  <td className="px-4 py-4">{player.matches_played - player.wins - player.losses}</td>
                  <td className="px-4 py-4">{player.win_percentage}%</td>
                  {currentUser?.role === "admin" && (
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatLastLogin(player.last_sign_in_at)}
                    </td>
                  )}
                  {currentUser?.role === "admin" && (
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            onEdit(player);
                          }}
                          className="p-1 hover:text-primary"
                          aria-label="Edit player"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            onDelete(player.id);
                          }}
                          className="p-1 hover:text-destructive"
                          aria-label="Delete player"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={currentUser?.role === "admin" ? 9 : 7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No players found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
