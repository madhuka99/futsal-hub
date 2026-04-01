// TopPlayersCard.jsx
"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Activity, TrendingUp } from "lucide-react";
import { GiSoccerBall } from "react-icons/gi";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function TopPlayersCard({ players }) {
  console.log(players);
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Top Players</CardTitle>
          <Link href="/players" passHref>
            <Button variant="ghost" className="h-8 text-sm">
              View all
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="winrate">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="winrate" className="flex-1">
              Win %
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex-1">
              Matches
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex-1">
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="winrate" className="mt-0">
            <div className="space-y-2">
              {players.winrate?.length > 0 ? (
                players.winrate.map((player, index) => (
                  <div key={player.id} className="flex items-center py-2">
                    <div className="w-6 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8 mr-2 ml-2">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {player.full_name}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="mr-1 text-primary" size={16} />
                      <span className="font-semibold">
                        {Math.round(player.win_percentage || 0)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No win rate data available
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="mt-0">
            <div className="space-y-2">
              {players.matches?.length > 0 ? (
                players.matches.map((player, index) => (
                  <div key={player.id} className="flex items-center py-2">
                    <div className="w-6 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8 mr-2 ml-2">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {player.full_name}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Activity className="mr-1 text-primary" size={16} />
                      <span className="font-semibold">
                        {player.matches_played || 0}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No match data available
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-0">
            <div className="space-y-2">
              {players.goals?.length > 0 ? (
                players.goals.map((player, index) => (
                  <div key={player.id} className="flex items-center py-2">
                    <div className="w-6 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8 mr-2 ml-2">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {player.full_name}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <GiSoccerBall className="mr-1 text-primary" size={16} />
                      <span className="font-semibold">{player.total_goals || 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No goal data available
                </div>
              )}
            </div>
          </TabsContent>


        </Tabs>
      </CardContent>
    </Card>
  );
}
