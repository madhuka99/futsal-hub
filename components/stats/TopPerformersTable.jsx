// TopPerformersTable.jsx
"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Trophy, ArrowUpDown } from "lucide-react";
import { GiSoccerBall } from "react-icons/gi";
import { FaHandsHelping } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TopPerformersTable({ players }) {
  const [sortField, setSortField] = useState("goals");
  const [sortDirection, setSortDirection] = useState("desc");
  const [limit, setLimit] = useState(5);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedPlayers = [...players]
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortDirection === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    })
    .slice(0, limit);

  // Calculate efficiency ratio (goals + assists) / matches
  const calculateEfficiency = (player) => {
    if (!player.matches_played) return 0;
    return ((player.goals + player.assists) / player.matches_played).toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performers</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("matches_played")}
                >
                  <div className="flex items-center gap-1">
                    Matches
                    {sortField === "matches_played" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      ))}
                    {sortField !== "matches_played" && (
                      <ArrowUpDown size={14} />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("goals")}
                >
                  <div className="flex items-center gap-1">
                    Goals
                    {sortField === "goals" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      ))}
                    {sortField !== "goals" && <ArrowUpDown size={14} />}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("assists")}
                >
                  <div className="flex items-center gap-1">
                    Assists
                    {sortField === "assists" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      ))}
                    {sortField !== "assists" && <ArrowUpDown size={14} />}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("mvp_count")}
                >
                  <div className="flex items-center gap-1">
                    MVP
                    {sortField === "mvp_count" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      ))}
                    {sortField !== "mvp_count" && <ArrowUpDown size={14} />}
                  </div>
                </TableHead>
                <TableHead>Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.map((player, index) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {player.avatar_url ? (
                          <AvatarImage
                            src={player.avatar_url}
                            alt={player.full_name}
                          />
                        ) : (
                          <AvatarFallback>
                            {player.full_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium truncate max-w-[120px]">
                        {player.full_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{player.matches_played}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <GiSoccerBall className="text-primary" size={15} />
                      {player.goals}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FaHandsHelping className="text-primary" size={15} />
                      {player.assists}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Trophy className="text-primary" size={15} />
                      {player.mvp_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="bg-primary/10 px-2 py-1 rounded-full text-sm text-center">
                      {calculateEfficiency(player)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {limit < players.length && (
          <div className="py-3 px-4 flex justify-center">
            <Button variant="outline" onClick={() => setLimit(players.length)}>
              Show All Players
            </Button>
          </div>
        )}

        {limit === players.length && limit > 5 && (
          <div className="py-3 px-4 flex justify-center">
            <Button variant="outline" onClick={() => setLimit(5)}>
              Show Less
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
