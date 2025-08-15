import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="container my-8 min-h-[calc(100vh-10rem)]">
      <Skeleton className="h-9 max-w-md rounded-md" />
      <Skeleton className="max-w-xsm ml-auto mr-0 mt-4 h-6 rounded-md" />
      <ul className="mt-4 grid grid-flow-row-dense grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {[...Array(10)].map((x, i) => (
          <Skeleton
            key={i}
            className={`aspect-3/2 h-full w-full cursor-pointer rounded-md object-cover ${
              i % 7 ? "" : "col-span-2 row-span-2"
            }`}
          />
        ))}
      </ul>
    </main>
  );
}
