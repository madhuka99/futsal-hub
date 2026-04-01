// PositionBreakdown.jsx
"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export function PositionBreakdown({ players }) {
  // Calculate position distribution
  const countPositions = () => {
    const positionCounts = {
      Forward: 0,
      Midfielder: 0,
      Defender: 0,
      Goalkeeper: 0,
      Unspecified: 0,
    };

    players.forEach((player) => {
      if (!player.preferred_position) {
        positionCounts.Unspecified++;
      } else {
        positionCounts[player.preferred_position]++;
      }
    });

    return Object.entries(positionCounts)
      .filter(([_, count]) => count > 0)
      .map(([position, count]) => ({
        name: position,
        value: count,
      }));
  };

  // Calculate goal distribution by position
  const countGoalsByPosition = () => {
    const goalsByPosition = {
      Forward: 0,
      Midfielder: 0,
      Defender: 0,
      Goalkeeper: 0,
      Unspecified: 0,
    };

    players.forEach((player) => {
      const position = player.preferred_position || "Unspecified";
      goalsByPosition[position] += player.goals || 0;
    });

    return Object.entries(goalsByPosition)
      .filter(([_, count]) => count > 0)
      .map(([position, count]) => ({
        name: position,
        value: count,
      }));
  };

  const positionData = countPositions();
  const goalData = countGoalsByPosition();

  // Colors for different positions
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6b7280"];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-sm">
          <p className="text-sm font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Position Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-center mb-2">
              Player Position Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={positionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {positionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-sm font-medium text-center mb-2">
              Goals by Position
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={goalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {goalData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-6">
          {positionData.map((position, index) => (
            <div key={position.name} className="flex items-center p-2">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex justify-between w-full">
                <span className="text-sm">{position.name}</span>
                <span className="text-sm font-medium">
                  {position.value} players
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
