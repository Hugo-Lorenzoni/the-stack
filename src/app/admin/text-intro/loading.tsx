import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function TextIntroLoadingPage() {
  return (
    <>
      <h2>Modification du texte d&apos;introduction</h2>
      <div className="mt-4 flex max-w-xl flex-1 flex-col gap-2 text-sm">
        <div className="space-y-2">
          <div className="py-0.5">Titre</div>
          <Skeleton className="h-10 w-full border border-input" />
        </div>
        <div className="flex flex-1 flex-col space-y-2">
          <div className="py-0.5">Texte d&apos;introduction</div>
          <Skeleton className="h-full w-full border border-input" />
        </div>
        <div className="space-y-2">
          <div className="py-0.5">Signature</div>
          <Skeleton className="h-10 w-full border border-input" />
        </div>
        <div className="space-y-2">
          <div className="py-0.5">Date</div>
          <Skeleton className="h-10 w-full border border-input" />
        </div>
        <Button disabled>Submit</Button>
        <Button disabled variant="outline">
          Reset
        </Button>
      </div>
    </>
  );
}
