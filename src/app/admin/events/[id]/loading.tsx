import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";

export default function EventLoadingPage() {
  return (
    <main className="mt-8 min-h-[calc(100vh-10rem)]">
      <h1 className="relative w-fit pb-1 text-3xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
        <Skeleton className="h-8 w-48" />
      </h1>
      <div className="mt-4 w-full">
        <Skeleton className="ml-auto h-6 w-20" />
      </div>
      <div className="mt-4 max-w-lg space-y-2">
        <div className="py-0.5 text-sm">Ajouter des photos</div>
        <Skeleton className="border-input h-11 border" />
        <Button disabled>Add</Button>
        <Button disabled variant="outline" className="ml-4">
          Reset
        </Button>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button disabled>
          <Pencil className="size-4" />
          Edit
        </Button>
        <Button className="bg-red-600 hover:bg-red-500" disabled>
          Supprimer l&apos;événement
        </Button>
      </div>
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
