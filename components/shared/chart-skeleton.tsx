"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-[150px]" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}