"use client";

import { Button } from "@/components/ui/button";
import { Cercle, Role } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import Image from "next/image";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Sponsor = {
  name: string;
  url: string;
  logoName: string;
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
};

export const columns: ColumnDef<Sponsor>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Nom du sponsor
          <Button
            className="ml-2 hover:bg-neutral-200 px-3 rounded-lg"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "url",
    header: "Lien",
    cell: ({ row }) => {
      const sponsor = row.original;

      return (
        <a className="underline text-blue-600" href={sponsor.url}>
          {sponsor.url}
        </a>
      );
    },
  },
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => {
      const sponsor = row.original;

      return (
        <Image
          className="object-contain h-16 w-fit"
          src={sponsor.logoUrl}
          width={sponsor.logoWidth}
          height={sponsor.logoHeight}
          alt={sponsor.name}
        />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sponsor = row.original;

      return (
        <Button>
          <span className="pr-2">Edit</span>
          <Pencil className="w-4 h-4" />
        </Button>
      );
    },
  },
];
