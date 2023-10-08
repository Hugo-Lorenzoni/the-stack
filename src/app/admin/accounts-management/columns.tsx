"use client";

import { Button } from "@/components/ui/button";
import { Cercle, Role } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import EditUser from "./EditUser";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  email: string;
  name: string;
  surname: string;
  role: Role;
  cercle: Cercle | string | null;
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
    accessorKey: "role",
    header: "Type",
  },
  {
    accessorKey: "cercle",
    header: "Cercle",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <EditUser rowUser={user} />;
    },
  },
];
