// components/matches/empty-matches.jsx
import { Button } from "@/components/ui/button";

export function EmptyMatches({ isAdmin = false, onCreate }) {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-medium text-muted-foreground">
        No matches found
      </h3>
      {isAdmin && (
        <p className="mt-2">Click the "New Match" button to create one</p>
      )}
    </div>
  );
}
