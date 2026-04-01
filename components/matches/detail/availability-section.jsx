// components/matches/detail/availability-section.jsx
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  X,
  Clock,
  Loader2,
  Search,
  UserCheck,
  UserX,
  HelpCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabaseBrowser } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function AvailabilitySection({
  match,
  userId,
  availability,
  isUpcoming,
  onUpdate,
}) {
  const [submittingAvailability, setSubmittingAvailability] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Get current user's availability
  const userAvailability =
    availability.find((a) => a.user_id === userId)?.status || "undecided";

  // Format player name initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Update user availability
  const handleAvailabilityChange = async (status) => {
    if (!userId) return;

    setSubmittingAvailability(true);
    try {
      // Check if user already has availability record
      const existingAvailability = availability.find(
        (a) => a.user_id === userId
      );

      if (existingAvailability) {
        // Update existing record
        const { error } = await supabaseBrowser
          .from("availability")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", existingAvailability.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabaseBrowser.from("availability").insert([
          {
            match_id: match.id,
            user_id: userId,
            status,
          },
        ]);

        if (error) throw error;
      }

      // Refresh availability data
      await fetchAvailability();

      toast.success("Availability updated");

      // Send push notification about availability change
      if (status === "available") {
        fetch("/api/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "player_available",
            title: "Player Available",
            body: `A player marked themselves available for the match`,
            url: `/matches/${match.id}`,
            excludeUserId: userId,
          }),
        }).catch(() => {});
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    } finally {
      setSubmittingAvailability(false);
    }
  };

  // Fetch availability
  const fetchAvailability = async () => {
    setIsLoadingAvailability(true);
    try {
      const { data: availabilityData, error } = await supabaseBrowser
        .from("availability")
        .select(
          `
          *,
          player:profiles(id, full_name, avatar_url, email)
        `
        )
        .eq("match_id", match.id);

      if (error) throw error;

      // Update parent component
      onUpdate(availabilityData || []);

      setIsLoadingAvailability(false);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setIsLoadingAvailability(false);
    }
  };

  // Calculate availability stats
  const availableCount = availability.filter(
    (a) => a.status === "available"
  ).length;
  const maybeCount = availability.filter((a) => a.status === "maybe").length;
  const notAvailableCount = availability.filter(
    (a) => a.status === "not available"
  ).length;
  const totalResponses = availableCount + maybeCount + notAvailableCount;

  // Filter players based on search term
  const filterPlayers = (players) => {
    if (!searchTerm) return players;
    return players.filter((item) =>
      item.player?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Player list component
  const PlayerList = ({ players, emptyMessage }) => {
    const filteredPlayers = filterPlayers(players);

    return (
      <div className="space-y-1">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((item) => (
            <div
              key={item.id}
              className="flex items-center p-2.5 rounded-md hover:bg-muted transition-colors"
            >
              <Avatar className="h-8 w-8 mr-3 border border-border">
                <AvatarImage
                  src={item.player?.avatar_url}
                  alt={item.player?.full_name}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(item.player?.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 font-medium text-sm">
                {item.player?.full_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(item.updated_at).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Users className="h-10 w-10 mb-3 opacity-20" />
            <p>{emptyMessage}</p>
            {searchTerm && (
              <p className="text-xs mt-1">Try a different search term</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* User's Availability Section - for upcoming matches */}
      {isUpcoming && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Availability</CardTitle>
            <CardDescription>
              Let the team know if you can make it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button
                variant={
                  userAvailability === "available" ? "default" : "outline"
                }
                className={
                  userAvailability === "available"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
                onClick={() => handleAvailabilityChange("available")}
                disabled={submittingAvailability}
              >
                <Check className="mr-2 h-4 w-4" />
                Available
              </Button>

              <Button
                variant={userAvailability === "maybe" ? "default" : "outline"}
                className={
                  userAvailability === "maybe"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : ""
                }
                onClick={() => handleAvailabilityChange("maybe")}
                disabled={submittingAvailability}
              >
                <Clock className="mr-2 h-4 w-4" />
                Maybe
              </Button>

              <Button
                variant={
                  userAvailability === "not available" ? "default" : "outline"
                }
                className={
                  userAvailability === "not available"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }
                onClick={() => handleAvailabilityChange("not available")}
                disabled={submittingAvailability}
              >
                <X className="mr-2 h-4 w-4" />
                Not Available
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Availability List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Player Availability</CardTitle>
              {match?.date && (
                <CardDescription className="mt-1.5">
                  {new Date(match.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              )}
            </div>
          </div>

          {/* Availability summary */}
          {!isLoadingAvailability && (
            <div className="flex gap-3 mt-4">
              <div className="flex-1 rounded-lg p-2.5 border flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-green-700">
                  {availableCount}
                </span>
                <span className="text-xs text-green-600 mt-1 flex items-center">
                  <UserCheck className="mr-1 h-3.5 w-3.5" />
                  Available
                </span>
              </div>

              <div className="flex-1 rounded-lg p-2.5 border flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-yellow-700">
                  {maybeCount}
                </span>
                <span className="text-xs text-yellow-600 mt-1 flex items-center">
                  <HelpCircle className="mr-1 h-3.5 w-3.5" />
                  Maybe
                </span>
              </div>

              <div className="flex-1 rounded-lg p-2.5 border flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-red-700">
                  {notAvailableCount}
                </span>
                <span className="text-xs text-red-600 mt-1 flex items-center">
                  <UserX className="mr-1 h-3.5 w-3.5" />
                  Declined
                </span>
              </div>
            </div>
          )}

          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {isLoadingAvailability ? (
            <div className="py-16 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="text-sm">Loading player availability...</p>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-4 w-full grid grid-cols-4">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="available" className="text-xs">
                  <UserCheck className="hidden md:flex  mr-1 h-3.5 w-3.5 text-green-500" />
                  Available
                </TabsTrigger>
                <TabsTrigger value="maybe" className="text-xs">
                  <HelpCircle className="hidden md:flex  mr-1 h-3.5 w-3.5 text-yellow-500" />
                  Maybe
                </TabsTrigger>
                <TabsTrigger value="not-available" className="text-xs">
                  <UserX className="hidden md:flex  mr-1 h-3.5 w-3.5 text-red-500" />
                  Declined
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[350px]">
                <TabsContent value="all" className="mt-0 space-y-4">
                  {/* Available Section */}
                  <div>
                    <h3 className="text-sm font-semibold flex items-center mb-2 px-2">
                      <UserCheck className="mr-1 h-3.5 w-3.5 text-green-500" />
                      Available ({availableCount})
                    </h3>
                    <PlayerList
                      players={availability.filter(
                        (a) => a.status === "available"
                      )}
                      emptyMessage="No players available yet"
                    />
                  </div>

                  {/* Maybe Section */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold flex items-center mb-2 px-2">
                      <HelpCircle className="mr-1 h-3.5 w-3.5 text-yellow-500" />
                      Maybe ({maybeCount})
                    </h3>
                    <PlayerList
                      players={availability.filter((a) => a.status === "maybe")}
                      emptyMessage="No maybe responses yet"
                    />
                  </div>

                  {/* Not Available Section */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold flex items-center mb-2 px-2">
                      <UserX className="mr-1 h-3.5 w-3.5 text-red-500" />
                      Not Available ({notAvailableCount})
                    </h3>
                    <PlayerList
                      players={availability.filter(
                        (a) => a.status === "not available"
                      )}
                      emptyMessage="No players have declined yet"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="available" className="mt-0">
                  <PlayerList
                    players={availability.filter(
                      (a) => a.status === "available"
                    )}
                    emptyMessage="No players available yet"
                  />
                </TabsContent>

                <TabsContent value="maybe" className="mt-0">
                  <PlayerList
                    players={availability.filter((a) => a.status === "maybe")}
                    emptyMessage="No maybe responses yet"
                  />
                </TabsContent>

                <TabsContent value="not-available" className="mt-0">
                  <PlayerList
                    players={availability.filter(
                      (a) => a.status === "not available"
                    )}
                    emptyMessage="No players have declined yet"
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </>
  );
}
