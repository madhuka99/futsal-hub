// DashboardHeader.jsx
"use client";
import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ currentUser }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {currentUser?.full_name || "Player"}
        </p>
      </div>
    </div>
  );
}
