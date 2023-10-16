"use client";

import { Button } from "@/components/ui/button";
import { Type } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import EventRowActions from "@/components/EventRowActions";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Event = {
  id: string;
  title: string;
  date: string;
  pinned: boolean;
  type: Type;
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Nom de l&apos;événement
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
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "pinned",
    header: "Pinned",
  },
  {
    accessorKey: "type",
    header: "Catégorie",
  },
  {
    id: "actions",
    cell: (props) => <EventRowActions row={props.row} />,
  },
];
