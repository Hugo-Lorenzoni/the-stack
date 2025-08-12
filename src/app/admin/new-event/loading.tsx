import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section>
      <h2>New Event Page</h2>
      <div className="mt-4 max-w-xl space-y-2 text-sm">
        <div className="space-y-2">
          <div className="py-0.5">Nom de l&apos;événement</div>
          <Skeleton className="h-10 w-full border border-input" />
        </div>
        <div className="space-y-2">
          <div className="py-0.5">Date de l&apos;événement</div>
          <Skeleton className="h-10 w-full border border-input" />
        </div>
        <div className="space-y-2">
          <div className="py-0.5">
            Notes{" "}
            <span className="italic text-neutral-400">(facultatives)</span>
          </div>
          <Skeleton className="h-20 w-full border border-input" />
          <p>
            Ces notes seront affichées avant les photos de l&apos;événement.
          </p>
        </div>
        <Skeleton className="h-20 w-full border border-input" />
        <div className="space-y-2">
          <div className="py-0.5">Photo de couverture</div>
          <Skeleton className="h-10 w-full border border-input" />
        </div>
        <div className="space-y-2">
          <div className="py-1">Type</div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20 border border-input" />
            <Skeleton className="h-4 w-16 border border-input" />
            <Skeleton className="h-4 w-24 border border-input" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="py-0.5">Photos de l&apos;événement</div>
          <Skeleton className="h-10 w-full border border-input" />
        </div>
        <Button disabled>Submit</Button>
        <Button className="ml-4" disabled variant="outline">
          Reset
        </Button>
      </div>
    </section>
  );
}
