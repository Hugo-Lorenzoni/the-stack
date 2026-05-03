"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Link from "./Link";

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
  const searchParams = useSearchParams();
  const path = usePathname();

  const page = searchParams.get("page") ?? "1";

  return (
    <>
      {hasPrevPage || hasNextPage ? (
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button disabled={!hasPrevPage} asChild>
            <Link
              href={`${path}/?page=${Number(page) - 1}`}
              className={
                !hasPrevPage ? "pointer-events-none opacity-50 select-none" : ""
              }
              aria-disabled={!hasPrevPage}
              tabIndex={!hasPrevPage ? -1 : undefined}
            >
              Précédent
            </Link>
          </Button>

          <div>
            {page} / {Math.ceil(countEvents / eventPerPage)}
          </div>

          <Button disabled={!hasNextPage} asChild>
            <Link
              href={`${path}/?page=${Number(page) + 1}`}
              className={
                !hasNextPage ? "pointer-events-none opacity-50 select-none" : ""
              }
              aria-disabled={!hasNextPage}
              tabIndex={!hasNextPage ? -1 : undefined}
            >
              Suivant
            </Link>
          </Button>
        </div>
      ) : null}
    </>
  );
}
