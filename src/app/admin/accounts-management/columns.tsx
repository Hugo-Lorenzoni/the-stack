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
  createdAt: Date;
};

const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Email
          <Button
            className="ml-2 rounded-lg px-3 hover:bg-neutral-200"
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
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="inline-flex items-center">
          Date de création
          <Button
            className="ml-2 rounded-lg px-3 hover:bg-neutral-200"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div>{row.original.createdAt.toLocaleDateString("fr-BE", options)}</div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <EditUser rowUser={user} />;
    },
  },
];
