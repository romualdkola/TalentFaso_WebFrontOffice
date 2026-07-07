import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-24" />
      </CardFooter>
    </Card>
  );
}
