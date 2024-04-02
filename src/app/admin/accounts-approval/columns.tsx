"use client";

import { Button } from "@/components/ui/button";
import { User_cercle } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import ApprovalRowActions from "@/app/admin/accounts-approval/ApprovalRowActions";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string;
  email: string;
  name: string;
  surname: string;
  cercle: User_cercle | string;
  ville: string;
  promo: number | null;
  createdAt: Date;
};

const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "Code de validation",
  },
  // {
  //   accessorKey: "email",
  //   header: ({ column }) => {
  //     return (
  //       <div className="flex items-center">
  //         Email
  //         <Button
  //           className="ml-2 rounded-lg px-3 hover:bg-neutral-200"
  //           variant="ghost"
  //           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //         >
  //           <ArrowUpDown className="h-4 w-4" />
  //         </Button>
  //       </div>
  //     );
  //   },
  // },
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
    cell: (props) => <ApprovalRowActions row={props.row} />,
  },
];
