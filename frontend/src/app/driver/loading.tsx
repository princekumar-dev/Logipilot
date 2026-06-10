'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function DriverLoading() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Welcome Skeleton */}
      <div className="flex flex-col gap-2 pt-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
      </div>

      {/* Current Assignment Skeleton */}
      <Skeleton className="h-[280px] w-full rounded-3xl" />

      {/* AI Alerts Skeleton */}
      <Skeleton className="h-24 w-full rounded-3xl" />
    </div>
  );
}
