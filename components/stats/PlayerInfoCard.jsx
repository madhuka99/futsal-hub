// components/stats/PlayerInfoCard.jsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function PlayerInfoCard({ playerStats }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={playerStats.avatar_url}
              alt={playerStats.full_name}
            />
            <AvatarFallback className="text-lg">
              {playerStats.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{playerStats.full_name}</h2>
            <p className="text-muted-foreground">{playerStats.email}</p>
            {playerStats.preferred_position && (
              <Badge variant="outline" className="mt-1">
                {playerStats.preferred_position}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
