import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function TextIntroLoadingPage() {
  return (
    <>
      <h2>Modification du texte d&apos;introduction</h2>
      <div className="mt-4 flex max-w-xl flex-1 flex-col gap-2 text-sm">
        <div className="space-y-2">
          <div>Titre</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div>Texte d&apos;introduction</div>
          <Skeleton className="border-input h-full w-full border" />
        </div>
        <div className="space-y-2">
          <div>Signature</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <div className="space-y-2">
          <div>Date</div>
          <Skeleton className="border-input h-10 w-full border" />
        </div>
        <div className="flex items-center gap-2">
          <Button disabled>Submit</Button>
          <Button disabled variant="outline">
            Reset
          </Button>
        </div>
      </div>
    </>
  );
}
