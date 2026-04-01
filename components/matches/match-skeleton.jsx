// components/matches/match-skeleton.jsx
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MatchSkeleton() {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/3 mb-2" />
      </CardContent>
      <CardFooter className="pt-0">
        <Skeleton className="h-4 w-full" />
      </CardFooter>
    </Card>
  );
}
