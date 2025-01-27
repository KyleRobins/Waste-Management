"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
        <div className="rounded-md border">
          <div className="h-12 border-b px-4 bg-muted/50">
            <div className="flex items-center h-full">
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-4 border-b last:border-none">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[70px]" />
            <Skeleton className="h-8 w-[70px]" />
          </div>
        </div>
      </div>
    </div>
  );
}