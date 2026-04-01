"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function ScrollableList({ children }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startY = 0;

    const onTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      e.stopPropagation();
      const dy = startY - e.touches[0].clientY;
      el.scrollTop += dy;
      startY = e.touches[0].clientY;
      e.preventDefault();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="h-[110px] w-[70px] rounded-md border overflow-y-auto"
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

export function DateTimePicker({ value, onChange, className }) {
  // Track initialization with ref
  const initialized = React.useRef(false);
  const skipUpdateRef = React.useRef(true);

  // Create a ref for value to compare changes
  const prevValueRef = React.useRef(value);

  // State for the internal date that we'll display and manipulate
  const [internalDate, setInternalDate] = React.useState(null);

  // Popover state
  const [isOpen, setIsOpen] = React.useState(false);

  // Initialize on first render
  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      if (value) {
        try {
          let dateObj = null;

          if (typeof value === "object" && value.date && value.time) {
            dateObj = new Date(`${value.date}T${value.time}`);
          } else if (typeof value === "string") {
            if (value.includes("T")) {
              dateObj = new Date(value);
            } else if (value.includes("-") && value.length >= 10) {
              const [dateStr, timeStr] = value.split(" ");
              if (timeStr) {
                dateObj = new Date(`${dateStr}T${timeStr}`);
              } else {
                dateObj = new Date(dateStr);
              }
            }
          } else if (value instanceof Date) {
            dateObj = new Date(value);
          }

          if (dateObj && !isNaN(dateObj.getTime())) {
            setInternalDate(dateObj);
            prevValueRef.current = value;
          }
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }
    }
  }, []);

  // Function to notify parent component of changes - outside of useEffect
  const notifyParent = React.useCallback(
    (date) => {
      if (!date || !onChange) return;

      try {
        // Format date as YYYY-MM-DD
        const formattedDate = format(date, "yyyy-MM-dd");
        // Format time as HH:mm:ss
        const formattedTime = format(date, "HH:mm:ss");

        // Don't call onChange during initialization
        if (skipUpdateRef.current) {
          skipUpdateRef.current = false;
          return;
        }

        onChange({
          date: formattedDate,
          time: formattedTime,
          fullDate: date,
        });
      } catch (error) {
        console.error("Error formatting date:", error);
      }
    },
    [onChange]
  );

  // Handle date selection
  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;

    try {
      const newDate = new Date(selectedDate);

      // Preserve the time from the existing date if there is one
      if (internalDate) {
        newDate.setHours(
          internalDate.getHours(),
          internalDate.getMinutes(),
          internalDate.getSeconds()
        );
      }

      setInternalDate(newDate);
      notifyParent(newDate);
    } catch (error) {
      console.error("Error setting date:", error);
    }
  };

  // Handle time selection
  const handleTimeChange = (type, value) => {
    try {
      // Create a new date object to avoid direct state mutation
      const newDate = internalDate ? new Date(internalDate) : new Date();

      if (type === "hour") {
        const hour = parseInt(value, 10);
        // Get current AM/PM setting
        const isPM = newDate.getHours() >= 12;
        // Set hours preserving AM/PM setting
        newDate.setHours(
          hour === 12 ? (isPM ? 12 : 0) : isPM ? hour + 12 : hour
        );
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value, 10));
      } else if (type === "ampm") {
        const hours = newDate.getHours();
        const hourIn12Format = hours % 12 || 12;

        if (value === "PM" && hours < 12) {
          newDate.setHours(hours + 12);
        } else if (value === "AM" && hours >= 12) {
          newDate.setHours(hourIn12Format);
        }
      }

      setInternalDate(newDate);
      notifyParent(newDate);
    } catch (error) {
      console.error("Error changing time:", error);
    }
  };

  // Helper to check if an hour button should be highlighted
  const isHourSelected = (hour) => {
    if (!internalDate) return false;

    const currentHour = internalDate.getHours() % 12;
    if (hour === 12) return currentHour === 0;
    return currentHour === hour;
  };

  // Helper to check if a minute button should be highlighted
  const isMinuteSelected = (minute) => {
    return internalDate && internalDate.getMinutes() === minute;
  };

  // Helper to check if AM/PM button should be highlighted
  const isAmPmSelected = (ampm) => {
    if (!internalDate) return false;

    const hours = internalDate.getHours();
    return (ampm === "AM" && hours < 12) || (ampm === "PM" && hours >= 12);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !internalDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {internalDate ? (
            format(internalDate, "PPP p") // More readable format
          ) : (
            <span>Select date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 !absolute !-top-36 !-right-30">
        <div className="flex flex-col">
          {/* Calendar remains the same */}
          <Calendar
            mode="single"
            selected={internalDate}
            onSelect={handleDateSelect}
            initialFocus
          />

          {/* Time picker section */}
          <div className="border-t border-border p-3">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground mb-1">Hour</div>
                <ScrollableList>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      className={cn(
                        "w-full h-8 flex items-center justify-center text-sm shrink-0",
                        isHourSelected(hour)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() =>
                        handleTimeChange("hour", hour.toString())
                      }
                    >
                      {hour.toString().padStart(2, "0")}
                    </button>
                  ))}
                </ScrollableList>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground mb-1">Minute</div>
                <ScrollableList>
                  {Array.from({ length: 12 }, (_, i) => i * 5).map(
                    (minute) => (
                      <button
                        key={minute}
                        type="button"
                        className={cn(
                          "w-full h-8 flex items-center justify-center text-sm shrink-0",
                          isMinuteSelected(minute)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() =>
                          handleTimeChange("minute", minute.toString())
                        }
                      >
                        {minute.toString().padStart(2, "0")}
                      </button>
                    )
                  )}
                </ScrollableList>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground mb-1">AM/PM</div>
                <div className="h-[110px] w-[70px] rounded-md border flex flex-col">
                  {["AM", "PM"].map((ampm) => (
                    <Button
                      key={ampm}
                      size="sm"
                      variant={isAmPmSelected(ampm) ? "default" : "ghost"}
                      className="flex-1 rounded-none"
                      onClick={() => handleTimeChange("ampm", ampm)}
                    >
                      {ampm}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-border flex justify-end">
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
