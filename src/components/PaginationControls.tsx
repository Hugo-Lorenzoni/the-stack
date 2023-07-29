"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";

export default function PaginationControls({
  currentUrl,
  countEvents,
  eventPerPage,
  hasNextPage,
  hasPrevPage,
}: {
  currentUrl: string;
  countEvents: number;
  eventPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") ?? "1";

  return (
    <div className="flex gap-2 justify-between items-center mt-4">
      <Button
        disabled={!hasPrevPage}
        onClick={() => {
          router.push(`${currentUrl}/?page=${Number(page) - 1}`);
        }}
      >
        Précédant
      </Button>

      <div>
        {page} / {Math.ceil(countEvents / eventPerPage)}
      </div>

      <Button
        disabled={!hasNextPage}
        onClick={() => {
          router.push(`${currentUrl}/?page=${Number(page) + 1}`);
        }}
      >
        Suivant
      </Button>
    </div>
  );
}
