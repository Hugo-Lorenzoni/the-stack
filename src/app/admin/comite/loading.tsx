import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ComiteLoadingPage() {
  return (
    <>
      <h2>Modification du comité</h2>
      <div className="mt-4 max-w-xl space-y-2 text-sm">
        <div className="space-y-2">
          <div className="py-0.5">Président</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <div className="space-y-2">
          <div className="py-0.5">Responsable Vidéo</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <div className="space-y-2">
          <div className="py-0.5">Responsable Photo</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <div className="space-y-2">
          <div className="py-0.5">Délégué Vidéo</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <div className="space-y-2">
          <div className="py-0.5">Délégué Photo</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <Button disabled>Submit</Button>
        <Button disabled className="ml-4" variant="outline">
          Reset
        </Button>
      </div>
    </>
  );
}
