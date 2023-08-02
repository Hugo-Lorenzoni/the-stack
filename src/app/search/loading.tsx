import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <ul className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
      <Skeleton className="rounded-2xl aspect-[3/2]" />
    </ul>
  );
}
