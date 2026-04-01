// components/matches/match-card.jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPin, Users } from "lucide-react";
import { format, parseISO } from "date-fns";

export function MatchCard({ match, onClick }) {
  const matchDate = parseISO(match.date);

  // Determine if match is upcoming based on score availability
  // Simple logic: If match has scores, it's completed; if no scores, it's upcoming
  const matchIsUpcoming =
    match.team1_score === null && match.team2_score === null;

  // Format the time properly
  const formatMatchTime = (timeString) => {
    if (!timeString) return null;
    try {
      const timeDate = parseISO(`2000-01-01T${timeString}`);
      return format(timeDate, "h:mm a");
    } catch {
      return timeString.substring(0, 5); // Fallback to HH:MM format
    }
  };

  const playersCount = match.match_players?.length || 0;

  return (
    <Card
      className="mb-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">Futsal Match</CardTitle>
          {matchIsUpcoming ? (
            <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>
          ) : (
            <Badge className="bg-gray-500 hover:bg-gray-600">Completed</Badge>
          )}
        </div>
        <CardDescription className="flex items-center mt-1">
          <CalendarIcon className="mr-1 h-4 w-4" />
          {format(matchDate, "PPP")}
          {match.startTime && <> at {formatMatchTime(match.startTime)}</>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="mr-1 h-4 w-4" />
          {match.location}
        </div>

        {!matchIsUpcoming &&
          match.team1_score !== null &&
          match.team2_score !== null && (
            <div className="mt-2 flex justify-center">
              <div className="grid grid-cols-3 w-full max-w-xs text-center">
                <div className="font-semibold">Team 1</div>
                <div className="font-bold text-lg">
                  {match.team1_score} - {match.team2_score}
                </div>
                <div className="font-semibold">Team 2</div>
              </div>
            </div>
          )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Users className="mr-1 h-4 w-4" />
          {playersCount} players
        </div>
        <div>Created by {match.created_by?.full_name || "Unknown"}</div>
      </CardFooter>
    </Card>
  );
}
