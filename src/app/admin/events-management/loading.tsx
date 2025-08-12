import { Skeleton } from "@/components/ui/skeleton";

export default function EventsManagementLoadingPage() {
  return (
    <>
      <h3 className="relative mt-4 w-fit text-xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
        Dernières publications :
      </h3>
      <ul className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <Skeleton className="aspect-[3/2] rounded-2xl" />
        <Skeleton className="aspect-[3/2] rounded-2xl" />
        <Skeleton className="aspect-[3/2] rounded-2xl" />
        <Skeleton className="aspect-[3/2] rounded-2xl" />
        <Skeleton className="aspect-[3/2] rounded-2xl" />
        <Skeleton className="aspect-[3/2] rounded-2xl" />
        <Skeleton className="aspect-[3/2] rounded-2xl" />
        <Skeleton className="aspect-[3/2] rounded-2xl" />
      </ul>
    </>
  );
}
