// components/matches/create-match-dialog.jsx
import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabaseBrowser } from "@/utils/supabase/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const matchFormSchema = z.object({
  datetime: z.object(
    {
      date: z.string({
        required_error: "Date is required",
      }),
      time: z.string({
        required_error: "Time is required",
      }),
    },
    {
      required_error: "Date and time are required",
    }
  ),
  location: z
    .string()
    .min(2, { message: "Location must be at least 2 characters" }),
});

export function CreateMatchDialog({ onMatchCreated }) {
  const [openDialog, setOpenDialog] = useState(false);

  // Setup form
  const form = useForm({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      location: "Phoenix Play Zone",
      datetime: undefined,
    },
  });

  // Function to calculate end time (start time + 2 hours)
  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHour = (hours + 2) % 24; // Add 2 hours, handle overflow past 24
    const endMinutes = minutes;

    return `${endHour.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to create a match");
        return;
      }

      const startTime = data.datetime.time;
      const endTime = calculateEndTime(startTime);

      const newMatch = {
        date: data.datetime.date,
        startTime: startTime, // Save to startTime column
        endTime: endTime, // Save calculated endTime
        location: data.location,
        created_by: user.id,
      };

      const { data: createdMatch, error } = await supabaseBrowser
        .from("matches")
        .insert([newMatch])
        .select(
          `
          *,
          created_by:profiles(full_name, email),
          match_players(*)
        `
        )
        .single();

      if (error) {
        throw error;
      }

      toast.success("Match created successfully!");

      // Send push notification to all users
      fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "match_created",
          title: "New Match Scheduled",
          body: `Match on ${new Date(createdMatch.date).toLocaleDateString()} at ${createdMatch.startTime || "TBD"} - ${createdMatch.location || "TBD"}`,
          url: `/matches/${createdMatch.id}`,
        }),
      }).catch(() => {});

      // Close dialog and reset form
      setOpenDialog(false);
      form.reset();

      // Notify parent component
      if (onMatchCreated) {
        onMatchCreated(createdMatch);
      }
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("Failed to create match");
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Match
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Match</DialogTitle>
          <DialogDescription>
            Set up a new futsal match. The match duration will be automatically
            set to 2 hours.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date and Start Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Select when the match will take place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Futsal Court" {...field} />
                  </FormControl>
                  <FormDescription>
                    Where the match will take place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Create Match</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
