// components/stats/MatchResultsChart.jsx
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
  result: {
    label: "Match Result",
    color: "var(--chart-2)",
  },
};

export function MatchResultsChart({ recentMatches, currentWinRate }) {
  const [matchLimit, setMatchLimit] = useState("all");

  // Process recent matches to create chart data
  const getChartData = () => {
    if (!recentMatches || recentMatches.length === 0) return [];

    // Sort matches by date (oldest first for chart progression)
    const reversed = [...recentMatches].reverse();
    const limit = matchLimit === "all" ? reversed.length : parseInt(matchLimit);
    const sortedMatches = reversed.slice(-limit);

    const chartData = [];

    sortedMatches.forEach((matchPlayer, index) => {
      const match = matchPlayer.match;
      if (!match || match.team1_score === null || match.team2_score === null) {
        return;
      }

      const userTeam = matchPlayer.team_number;
      const userTeamScore =
        userTeam === 1 ? match.team1_score : match.team2_score;
      const opponentScore =
        userTeam === 1 ? match.team2_score : match.team1_score;

      let result;
      let resultLabel;
      if (userTeamScore > opponentScore) {
        result = 1;
        resultLabel = "Win";
      } else if (userTeamScore < opponentScore) {
        result = -1;
        resultLabel = "Loss";
      } else {
        result = 0;
        resultLabel = "Draw";
      }

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
        result: result,
        resultLabel: resultLabel,
        score: `${userTeamScore}-${opponentScore}`,
        location: match.location,
      });
    });

    return chartData;
  };

  const chartData = getChartData();

  // Calculate recent form (last 5 matches)
  const getRecentForm = () => {
    if (chartData.length === 0)
      return { wins: 0, draws: 0, losses: 0, trend: "neutral" };

    const lastFive = chartData.slice(-5);
    const wins = lastFive.filter((match) => match.result === 1).length;
    const draws = lastFive.filter((match) => match.result === 0).length;
    const losses = lastFive.filter((match) => match.result === -1).length;

    // Calculate trend based on last 3 vs previous 2 in last 5
    let trend = "neutral";
    if (lastFive.length >= 3) {
      const recent3 = lastFive.slice(-3);
      const previous2 = lastFive.slice(-5, -3);

      const recent3Avg =
        recent3.reduce((sum, match) => sum + match.result, 0) / 3;
      const previous2Avg =
        previous2.length > 0
          ? previous2.reduce((sum, match) => sum + match.result, 0) /
            previous2.length
          : 0;

      if (recent3Avg > previous2Avg + 0.2) trend = "up";
      else if (recent3Avg < previous2Avg - 0.2) trend = "down";
    }

    return { wins, draws, losses, trend };
  };

  const recentForm = getRecentForm();

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match Results Flow</CardTitle>
          <CardDescription>Your match results over time</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">
            No match data available for chart
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
            <CardTitle>Match Results Flow</CardTitle>
            <CardDescription>
              Your last {chartData.length} match results
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
                domain={[-1.2, 1.2]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                ticks={[-1, 0, 1]}
                tickFormatter={(value) => {
                  if (value === 1) return "Win";
                  if (value === 0) return "Draw";
                  if (value === -1) return "Loss";
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
                              style={{ backgroundColor: "hsl(var(--chart-1))" }}
                            />
                            <span className="font-medium">
                              {data.resultLabel}
                            </span>
                            <span className="text-muted-foreground">
                              ({data.score})
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
                <linearGradient id="fillResult" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-result)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-result)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="result"
                type="monotone"
                fill="url(#fillResult)"
                fillOpacity={0.4}
                stroke="var(--color-result)"
                strokeWidth={2}
                dot={{ fill: "var(--color-result)", strokeWidth: 2, r: 4 }}
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
              {recentForm.trend === "up" && (
                <>
                  Recent form improving
                  <TrendingUp className="h-4 w-4" />
                </>
              )}
              {recentForm.trend === "down" && (
                <>
                  Recent form declining
                  <TrendingDown className="h-4 w-4" />
                </>
              )}
              {recentForm.trend === "neutral" && (
                <>
                  Form stable
                  <Minus className="h-4 w-4" />
                </>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Last 5: {recentForm.wins}W-{recentForm.draws}D-{recentForm.losses}
              L • Overall: {currentWinRate?.toFixed(1) || 0}% win rate
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
