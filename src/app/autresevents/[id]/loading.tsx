import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="container min-h-[calc(100vh_-_10rem)] my-8">
      <Skeleton className="rounded-md max-w-md h-9" />
      <Skeleton className="ml-auto mr-0 mt-4 rounded-md max-w-xsm h-6" />
      <ul className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-flow-row-dense">
        {[...Array(10)].map((x, i) => (
          <Skeleton
            key={i}
            className={`aspect-[3/2] w-full h-full object-cover rounded-md cursor-pointer ${
              i % 7 ? "" : "row-span-2 col-span-2"
            }`}
          />
        ))}
      </ul>
    </main>
  );
}
