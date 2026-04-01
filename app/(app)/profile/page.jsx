"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabaseBrowser } from "@/utils/supabase/client";
import {
  FaFutbol,
  FaHandshake,
  FaCalendarAlt,
  FaMedal,
  FaThumbsUp,
  FaThumbsDown,
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaSkull,
} from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { HiMiniTrophy } from "react-icons/hi2";

const positions = ["goalkeeper", "defender", "midfielder", "forward"];

export default function MyProfile() {
  const supabase = supabaseBrowser;
  const [profile, setProfile] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Fetch profile data from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;

          // Fetch player statistics from the view
          const { data: statsData, error: statsError } = await supabase
            .from("player_statistics")
            .select("*")
            .eq("id", user.id)
            .single();

          if (statsError) throw statsError;

          setProfile(profileData);
          setPlayerStats(statsData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  const handleUpdate = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          preferred_position: profile.preferred_position,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-28" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile || !playerStats) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <Card className="py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <FaUser className="text-5xl text-muted-foreground" />
              <h2 className="text-xl font-semibold">Profile Not Found</h2>
              <p className="text-muted-foreground">
                We couldn't find your profile information.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Player Profile
            </CardTitle>
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setEditing(true)}
              >
                <FaEdit className="text-sm" /> Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setEditing(false)}
                >
                  <FaTimes className="text-sm" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleUpdate}
                  disabled={loading}
                >
                  <FaSave className="text-sm" /> Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left column: Avatar and basic info */}
            <div className="flex flex-col items-center space-y-4 md:w-1/3">
              <div className="relative group">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || "Player avatar"}
                    width={160}
                    height={160}
                    className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-primary/20 object-cover aspect-square"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <FaUser className="text-4xl text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="w-full space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    Full Name
                  </label>
                  {editing ? (
                    <Input
                      type="text"
                      value={profile.full_name || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-lg font-medium">
                      {profile.full_name || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    Email
                  </label>
                  <p className="text-lg font-medium">{profile.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    Preferred Position
                  </label>
                  {editing ? (
                    <Select
                      value={profile.preferred_position || ""}
                      onValueChange={(value) =>
                        setProfile((prev) => ({
                          ...prev,
                          preferred_position: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position.charAt(0).toUpperCase() +
                              position.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-lg font-medium">
                      {profile.preferred_position
                        ? profile.preferred_position.charAt(0).toUpperCase() +
                          profile.preferred_position.slice(1)
                        : "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    Role
                  </label>
                  <p className="text-lg font-medium capitalize">
                    {profile.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Right column: Statistics */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-4">Player Statistics</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard
                  icon={<FaCalendarAlt className="text-blue-500" />}
                  label="Matches Played"
                  value={playerStats.matches_played || 0}
                />
                <StatCard
                  icon={<FaFutbol className="text-green-500" />}
                  label="Goals"
                  value={playerStats.total_goals || 0}
                />
                <StatCard
                  icon={<FaHandshake className="text-purple-500" />}
                  label="Assists"
                  value={playerStats.total_assists || 0}
                />
                <StatCard
                  icon={<FaMedal className="text-yellow-500" />}
                  label="MVP Awards"
                  value={playerStats.mvp_count || 0}
                />
                <StatCard
                  icon={<HiMiniTrophy className="text-emerald-500" />}
                  label="Wins"
                  value={playerStats.wins || 0}
                />
                <StatCard
                  icon={<FaSkull className="text-red-500" />}
                  label="Losses"
                  value={playerStats.losses || 0}
                />
              </div>

              {/* Performance Metrics */}
              <div className="mt-6 space-y-4">
                <h4 className="text-lg font-semibold">Performance Metrics</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Goals per Match
                    </div>
                    <div className="text-2xl font-bold">
                      {playerStats.goals_per_match?.toFixed(2) || "0.00"}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Win Percentage
                    </div>
                    <div className="text-2xl font-bold">
                      {playerStats.win_percentage?.toFixed(1) || "0.0"}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stat card component for cleaner code
function StatCard({ icon, label, value }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
