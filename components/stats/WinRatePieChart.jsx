// components/stats/WinRatePieChart.jsx
"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";
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

const chartConfig = {
  matches: {
    label: "Matches",
  },
  wins: {
    label: "Wins",
    color: "var(--chart-2)",
  },
  draws: {
    label: "Draws",
    color: "var(--chart-3)",
  },
  losses: {
    label: "Losses",
    color: "var(--chart-5)",
  },
};

export function WinRatePieChart({ playerStats }) {
  if (!playerStats) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Match Results Distribution</CardTitle>
          <CardDescription>Win/Draw/Loss breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { wins = 0, draws = 0, losses = 0, matches_played = 0 } = playerStats;

  // Calculate percentages
  const winPercentage =
    matches_played > 0 ? ((wins / matches_played) * 100).toFixed(1) : 0;
  const drawPercentage =
    matches_played > 0 ? ((draws / matches_played) * 100).toFixed(1) : 0;
  const lossPercentage =
    matches_played > 0 ? ((losses / matches_played) * 100).toFixed(1) : 0;

  const chartData = [
    {
      result: "wins",
      count: wins,
      fill: "var(--color-wins)",
      percentage: winPercentage,
    },
    {
      result: "draws",
      count: draws,
      fill: "var(--color-draws)",
      percentage: drawPercentage,
    },
    {
      result: "losses",
      count: losses,
      fill: "var(--color-losses)",
      percentage: lossPercentage,
    },
  ].filter((item) => item.count > 0); // Only show categories with data

  // Determine trend based on win percentage
  const getTrend = () => {
    const winRate = parseFloat(winPercentage);
    if (winRate >= 60) return { type: "up", message: "Strong performance" };
    if (winRate >= 40) return { type: "neutral", message: "Balanced record" };
    return { type: "down", message: "Room for improvement" };
  };

  const trend = getTrend();

  // Custom tooltip
  const renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: data.fill }}
              />
              <span className="font-medium capitalize">{data.result}</span>
            </div>
            <div className="text-sm">
              <span className="font-bold">{data.count}</span> matches
              <span className="text-muted-foreground">
                {" "}
                ({data.percentage}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (matches_played === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Match Results Distribution</CardTitle>
          <CardDescription>Win/Draw/Loss breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">No matches played yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Match Results Distribution</CardTitle>
        <CardDescription>{matches_played} total matches played</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={renderTooltip} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="result"
              outerRadius={80}
              innerRadius={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-2"></div>
              <span className="text-sm font-medium">Wins</span>
            </div>
            <div className="text-lg font-bold text-green-600">{wins}</div>
            <div className="text-xs text-muted-foreground">
              {winPercentage}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-3"></div>
              <span className="text-sm font-medium">Draws</span>
            </div>
            <div className="text-lg font-bold text-gray-600">{draws}</div>
            <div className="text-xs text-muted-foreground">
              {drawPercentage}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-5"></div>
              <span className="text-sm font-medium">Losses</span>
            </div>
            <div className="text-lg font-bold text-red-600">{losses}</div>
            <div className="text-xs text-muted-foreground">
              {lossPercentage}%
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {trend.type === "up" && (
            <>
              {trend.message} <TrendingUp className="h-4 w-4" />
            </>
          )}
          {trend.type === "down" && (
            <>
              {trend.message} <TrendingDown className="h-4 w-4" />
            </>
          )}
          {trend.type === "neutral" && (
            <>
              {trend.message} <Minus className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Win rate: {winPercentage}% • {matches_played} matches total
        </div>
      </CardFooter>
    </Card>
  );
}
