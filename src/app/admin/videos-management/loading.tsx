import { Skeleton } from "@/components/ui/skeleton";

export default function VideosManagementLoadingPage() {
  return (
    <section className="h-full">
      <h2 className="pb-4">Videos Management Page</h2>
      <Skeleton className="h-full w-full" />
    </section>
  );
}
