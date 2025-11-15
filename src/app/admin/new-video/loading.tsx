import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewVideoLoadingPage() {
  return (
    <section>
      <h2>New Video Page</h2>
      <div className="mt-4 flex max-w-xl flex-col gap-2 text-sm">
        <div className="space-y-2">
          <div className="py-0.5">Nom du la vidéo</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <div className="space-y-2">
          <div className="py-0.5">Lien de la vidéo</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <div className="space-y-2">
          <div className="py-0.5">Date de la vidéo</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <Button disabled>Submit</Button>
        <Button disabled variant="outline">
          Reset
        </Button>
      </div>
    </section>
  );
}
