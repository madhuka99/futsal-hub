// components/matches/match-tabs.jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MatchCard } from "./match-card";
import { MatchSkeleton } from "./match-skeleton";
import { EmptyMatches } from "./empty-matches";

export function MatchTabs({
  matches,
  isLoading,
  activeTab,
  setActiveTab,
  onMatchClick,
  isAdmin = false,
  onCreateMatch,
}) {
  return (
    <Tabs
      defaultValue="past"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="mb-4 w-full">
        <TabsTrigger value="past">Past Matches</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        <ScrollArea className="h-[calc(100vh-240px)]">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <MatchSkeleton key={i} />
              ))}
            </div>
          ) : matches.upcoming?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {matches.upcoming.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={() => onMatchClick(match.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyMatches isAdmin={isAdmin} onCreate={onCreateMatch} />
          )}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="past">
        <ScrollArea className="h-[calc(100vh-240px)]">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <MatchSkeleton key={i} />
              ))}
            </div>
          ) : matches.past?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {matches.past.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={() => onMatchClick(match.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyMatches />
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
