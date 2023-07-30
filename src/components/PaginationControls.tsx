"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "./ui/button";

export default function PaginationControls({
  countEvents,
  eventPerPage,
  hasNextPage,
  hasPrevPage,
}: {
  countEvents: number;
  eventPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();

  const page = searchParams.get("page") ?? "1";

  return (
    <div className="flex gap-2 justify-between items-center mt-4">
      <Button
        disabled={!hasPrevPage}
        onClick={() => {
          router.push(`${path}/?page=${Number(page) - 1}`);
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
          router.push(`${path}/?page=${Number(page) + 1}`);
        }}
      >
        Suivant
      </Button>
    </div>
  );
}
