"use client";

import { Button } from "@/components/ui/button";
import { Cercle } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import RowActions from "@/components/RowActions";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  email: string;
  name: string;
  surname: string;
  cercle: Cercle | string;
  ville: string;
  promo: number | null;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Email
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
    accessorKey: "name",
    header: "Prénom",
  },
  {
    accessorKey: "surname",
    header: "Nom",
  },
  {
    accessorKey: "cercle",
    header: "Cercle",
  },
  {
    accessorKey: "ville",
    header: "Ville",
  },
  {
    accessorKey: "promo",
    header: "Promo",
  },
  {
    id: "actions",
    cell: (props) => <RowActions row={props.row} />,
  },
];
