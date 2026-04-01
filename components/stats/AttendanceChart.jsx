// components/stats/AttendanceChart.jsx
"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartConfig = {
  attendance: {
    label: "Attendance",
    color: "var(--chart-4)",
  },
};

export function AttendanceChart({ allMatches }) {
  const [matchLimit, setMatchLimit] = useState("all");

  // Process all matches to create chart data with attendance status
  const getChartData = () => {
    if (!allMatches || allMatches.length === 0) return [];

    // Sort matches by date (oldest first for chart progression)
    const sorted = [...allMatches].sort(
      (a, b) => new Date(a.match.date) - new Date(b.match.date)
    );
    const limit = matchLimit === "all" ? sorted.length : parseInt(matchLimit);
    const sortedMatches = sorted.slice(-limit);

    const chartData = [];

    sortedMatches.forEach((matchPlayer, index) => {
      const match = matchPlayer.match;
      if (!match) {
        return;
      }

      // Attendance value (1 for attended, 0 for absent)
      const attendance = matchPlayer.attended ? 1 : 0;
      const attendanceLabel = matchPlayer.attended ? "Attended" : "Absent";

      const date = new Date(match.date);

      chartData.push({
        match: `Match ${index + 1}`,
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        attendance: attendance,
        attendanceLabel: attendanceLabel,
        location: match.location,
      });
    });

    return chartData;
  };

  const chartData = getChartData();

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    if (chartData.length === 0)
      return { total: 0, rate: 0, trend: "neutral" };

    const total = chartData.length;
    const attended = chartData.filter((match) => match.attendance === 1).length;
    const rate = (attended / total) * 100;

    // Calculate trend based on last 5 vs previous matches
    let trend = "neutral";
    if (chartData.length >= 8) {
      const recent5 = chartData.slice(-5);
      const previous3 = chartData.slice(-8, -5);

      const recent5Rate =
        recent5.filter((m) => m.attendance === 1).length / 5;
      const previous3Rate =
        previous3.filter((m) => m.attendance === 1).length / 3;

      if (recent5Rate > previous3Rate + 0.1) trend = "up";
      else if (recent5Rate < previous3Rate - 0.1) trend = "down";
    }

    return { total, attended, rate, trend };
  };

  const stats = getAttendanceStats();

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your match attendance over time</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">
            No attendance data available for chart
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>
              Your last {chartData.length} match attendance records
            </CardDescription>
          </div>
          <Select value={matchLimit} onValueChange={setMatchLimit}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Last 10</SelectItem>
              <SelectItem value="20">Last 20</SelectItem>
              <SelectItem value="30">Last 30</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-1 md:px-4">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                domain={[0, 1.2]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                ticks={[0, 1]}
                tickFormatter={(value) => {
                  if (value === 1) return "Attended";
                  if (value === 0) return "Absent";
                  return "";
                }}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {data.fullDate}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {data.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: data.attendance === 1
                                  ? "hsl(var(--chart-4))"
                                  : "hsl(var(--destructive))"
                              }}
                            />
                            <span className="font-medium">
                              {data.attendanceLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <defs>
                <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-attendance)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-attendance)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="attendance"
                type="monotone"
                fill="url(#fillAttendance)"
                fillOpacity={0.4}
                stroke="var(--color-attendance)"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isAttended = payload.attendance === 1;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={isAttended ? "var(--color-attendance)" : "hsl(var(--destructive))"}
                      strokeWidth={2}
                      stroke={isAttended ? "var(--color-attendance)" : "hsl(var(--destructive))"}
                    />
                  );
                }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {stats.trend === "up" && (
                <>
                  Attendance improving
                  <TrendingUp className="h-4 w-4" />
                </>
              )}
              {stats.trend === "down" && (
                <>
                  Attendance declining
                  <TrendingDown className="h-4 w-4" />
                </>
              )}
              {stats.trend === "neutral" && (
                <>
                  Consistent attendance
                  <Minus className="h-4 w-4" />
                </>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {stats.attended} of {stats.total} matches attended • {stats.rate.toFixed(1)}% attendance rate
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
