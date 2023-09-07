import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <main className="container min-h-[calc(100vh_-_10rem)] my-8">
      <h1 className="font-semibold text-2xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
        Événements ouverts
      </h1>
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
    </main>
  );
}
