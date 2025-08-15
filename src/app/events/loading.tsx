import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <main className="container my-8 min-h-[calc(100vh-10rem)]">
      <h1 className="relative w-fit text-2xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
        Événements ouverts
      </h1>
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
    </main>
  );
}
