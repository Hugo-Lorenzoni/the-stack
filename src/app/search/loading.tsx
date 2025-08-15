import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
      <Skeleton className="aspect-3/2 rounded-2xl" />
    </ul>
  );
}
