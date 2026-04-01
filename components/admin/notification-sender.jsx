"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Send,
  Users,
  User,
  Bell,
  CalendarClock,
  HelpCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function NotificationSender() {
  const [template, setTemplate] = useState("custom");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/dashboard");
  const [target, setTarget] = useState("everyone");
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [sending, setSending] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [matchAvailability, setMatchAvailability] = useState([]);

  useEffect(() => {
    fetchPlayers();
    fetchUpcomingMatches();
  }, []);

  // Fetch availability when a match is selected
  useEffect(() => {
    if (selectedMatchId) {
      fetchMatchAvailability(selectedMatchId);
    } else {
      setMatchAvailability([]);
    }
  }, [selectedMatchId]);

  const fetchPlayers = async () => {
    const { data: subscriptions } = await supabaseBrowser
      .from("push_subscriptions")
      .select("user_id");

    if (!subscriptions?.length) {
      setPlayers([]);
      setSubscriberCount(0);
      return;
    }

    const subscribedUserIds = [
      ...new Set(subscriptions.map((s) => s.user_id)),
    ];
    setSubscriberCount(subscribedUserIds.length);

    const { data } = await supabaseBrowser
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", subscribedUserIds)
      .order("full_name");
    if (data) setPlayers(data);
  };

  const fetchUpcomingMatches = async () => {
    const { data } = await supabaseBrowser
      .from("matches")
      .select("id, date, startTime, location")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(10);
    if (data) setMatches(data);
  };

  const fetchMatchAvailability = async (matchId) => {
    const { data } = await supabaseBrowser
      .from("availability")
      .select("user_id, status")
      .eq("match_id", matchId);
    setMatchAvailability(data || []);
  };

  const togglePlayer = (playerId) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const formatMatchLabel = (match) => {
    const date = new Date(match.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const time = match.startTime ? match.startTime.substring(0, 5) : "TBD";
    return `${date} at ${time}${match.location ? ` - ${match.location}` : ""}`;
  };

  const handleTemplateChange = (value) => {
    setTemplate(value);

    if (value === "custom") {
      setTitle("");
      setBody("");
      setUrl("/dashboard");
      setTarget("everyone");
      setSelectedMatchId("");
      return;
    }

    if (value === "match_reminder" || value === "availability_request") {
      // Auto-select first upcoming match if none selected
      if (!selectedMatchId && matches.length > 0) {
        setSelectedMatchId(matches[0].id);
        setUrl(`/matches/${matches[0].id}`);
      }
    }

    if (value === "match_reminder") {
      setTarget("everyone");
      if (selectedMatchId) {
        const match = matches.find((m) => m.id === selectedMatchId);
        if (match) {
          const date = new Date(match.date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          });
          const time = match.startTime
            ? match.startTime.substring(0, 5)
            : "TBD";
          setTitle("Match Reminder");
          setBody(
            `Don't forget about the match on ${date} at ${time}${match.location ? ` - ${match.location}` : ""}!`
          );
        }
      } else {
        setTitle("Match Reminder");
        setBody("Don't forget about the upcoming match!");
      }
    }

    if (value === "availability_request") {
      setTarget("not_responded");
      setTitle("Are You Available?");
      if (selectedMatchId) {
        const match = matches.find((m) => m.id === selectedMatchId);
        if (match) {
          const date = new Date(match.date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          });
          setBody(
            `Please mark your availability for the match on ${date}. Tap a button below to respond!`
          );
        }
      } else {
        setBody(
          "Please mark your availability for the upcoming match. Tap a button below to respond!"
        );
      }
    }
  };

  const handleMatchChange = (matchId) => {
    setSelectedMatchId(matchId);
    setUrl(`/matches/${matchId}`);

    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const date = new Date(match.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const time = match.startTime ? match.startTime.substring(0, 5) : "TBD";

    if (template === "match_reminder") {
      setTitle("Match Reminder");
      setBody(
        `Don't forget about the match on ${date} at ${time}${match.location ? ` - ${match.location}` : ""}!`
      );
    }

    if (template === "availability_request") {
      setTitle("Are You Available?");
      setBody(
        `Please mark your availability for the match on ${date}. Tap a button below to respond!`
      );
    }
  };

  // Get target user IDs based on targeting option
  const getTargetUserIds = () => {
    if (target === "selected") {
      return selectedPlayers;
    }

    if (target === "not_responded" && selectedMatchId) {
      const respondedIds = new Set(matchAvailability.map((a) => a.user_id));
      return players.filter((p) => !respondedIds.has(p.id)).map((p) => p.id);
    }

    if (target === "available_only" && selectedMatchId) {
      const availableIds = matchAvailability
        .filter((a) => a.status === "available")
        .map((a) => a.user_id);
      return availableIds;
    }

    return null; // everyone
  };

  const getTargetCount = () => {
    const ids = getTargetUserIds();
    if (!ids) return subscriberCount || 0;
    return ids.length;
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }

    if (target === "selected" && selectedPlayers.length === 0) {
      toast.error("Select at least one player");
      return;
    }

    if (
      (template === "match_reminder" || template === "availability_request") &&
      !selectedMatchId
    ) {
      toast.error("Please select a match");
      return;
    }

    const targetIds = getTargetUserIds();
    if (targetIds && targetIds.length === 0) {
      toast.error("No players match the selected targeting");
      return;
    }

    setSending(true);
    try {
      const payload = {
        type:
          template === "availability_request"
            ? "availability_request"
            : "admin_broadcast",
        title: title.trim(),
        body: body.trim(),
        url,
      };

      if (template === "availability_request" && selectedMatchId) {
        payload.matchId = selectedMatchId;
      }

      if (targetIds) {
        payload.userIds = targetIds;
      }

      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Notification sent to ${result.sent} device(s)`);
        setTitle("");
        setBody("");
        setUrl("/dashboard");
        setSelectedPlayers([]);
        setTemplate("custom");
        setSelectedMatchId("");
      } else {
        toast.error(result.error || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Check if match-specific targeting is available
  const showMatchSelector =
    template === "match_reminder" || template === "availability_request";
  const showMatchTargeting = showMatchSelector && selectedMatchId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Send Notification
          {subscriberCount !== null && (
            <Badge variant="secondary" className="ml-auto">
              {subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selector */}
        <div className="space-y-2">
          <Label>Template</Label>
          <Select value={template} onValueChange={handleTemplateChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Custom Message
                </div>
              </SelectItem>
              <SelectItem value="match_reminder">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  Match Reminder
                </div>
              </SelectItem>
              <SelectItem value="availability_request">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Availability Request
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Match Selector for templates */}
        {showMatchSelector && (
          <div className="space-y-2">
            <Label>Select Match</Label>
            <Select value={selectedMatchId} onValueChange={handleMatchChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a match..." />
              </SelectTrigger>
              <SelectContent>
                {matches.map((match) => (
                  <SelectItem key={match.id} value={match.id}>
                    {formatMatchLabel(match)}
                  </SelectItem>
                ))}
                {matches.length === 0 && (
                  <SelectItem value="_none" disabled>
                    No upcoming matches
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Availability stats for selected match */}
        {showMatchTargeting && matchAvailability.length > 0 && (
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="text-green-600 border-green-300">
              <UserCheck className="h-3 w-3 mr-1" />
              {matchAvailability.filter((a) => a.status === "available").length}{" "}
              available
            </Badge>
            <Badge variant="outline" className="text-red-600 border-red-300">
              <UserX className="h-3 w-3 mr-1" />
              {
                matchAvailability.filter((a) => a.status === "not available")
                  .length
              }{" "}
              declined
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              <HelpCircle className="h-3 w-3 mr-1" />
              {
                players.filter(
                  (p) => !matchAvailability.find((a) => a.user_id === p.id)
                ).length
              }{" "}
              no response
            </Badge>
          </div>
        )}

        {template === "availability_request" && (
          <p className="text-xs text-muted-foreground">
            This notification will include &quot;Available&quot; and &quot;Not
            Available&quot; action buttons. Players can respond directly from the
            notification without opening the app.
          </p>
        )}

        <Separator />

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g. Match Reminder"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="body">Message</Label>
          <Textarea
            id="body"
            placeholder="e.g. Don't forget about tomorrow's match at 7 PM!"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
          />
        </div>

        {/* Link - only show for custom template */}
        {template === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="url">Link (where notification click leads)</Label>
            <Select value={url} onValueChange={setUrl}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/dashboard">Dashboard</SelectItem>
                <SelectItem value="/matches">Matches</SelectItem>
                <SelectItem value="/players">Players</SelectItem>
                <SelectItem value="/stats">Stats</SelectItem>
                <SelectItem value="/gallery">Gallery</SelectItem>
                {matches.length > 0 && (
                  <>
                    <Separator className="my-1" />
                    {matches.map((match) => (
                      <SelectItem
                        key={match.id}
                        value={`/matches/${match.id}`}
                      >
                        {formatMatchLabel(match)}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Targeting */}
        <div className="space-y-2">
          <Label>Send to</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Everyone
                </div>
              </SelectItem>
              {showMatchTargeting && (
                <>
                  <SelectItem value="not_responded">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Haven&apos;t Responded
                    </div>
                  </SelectItem>
                  <SelectItem value="available_only">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Available Players Only
                    </div>
                  </SelectItem>
                </>
              )}
              <SelectItem value="selected">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Select Players
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Player selector for "selected" target */}
        {target === "selected" && (
          <div className="space-y-2">
            <Label>
              Select players{" "}
              {selectedPlayers.length > 0 && (
                <span className="text-muted-foreground">
                  ({selectedPlayers.length} selected)
                </span>
              )}
            </Label>
            <ScrollArea className="h-48 border rounded-md p-2">
              <div className="space-y-1">
                {players.map((player) => (
                  <label
                    key={player.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedPlayers.includes(player.id)}
                      onCheckedChange={() => togglePlayer(player.id)}
                    />
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={player.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(player.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {player.full_name || player.email}
                      </p>
                      {player.full_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {player.email}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={sending || !title.trim() || !body.trim()}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {sending
            ? "Sending..."
            : `Send to ${getTargetCount()} player${getTargetCount() !== 1 ? "s" : ""}`}
        </Button>
      </CardContent>
    </Card>
  );
}
