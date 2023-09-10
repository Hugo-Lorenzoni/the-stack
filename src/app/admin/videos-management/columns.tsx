"use client";

import { Button } from "@/components/ui/button";
import { Video } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import VideosRowActions from "./VideosRowActions";

const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Video>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Titre de la vidéo
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
      const video = row.original;

      return (
        <a className="underline text-blue-600" href={video.url}>
          {video.url}
        </a>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Date
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
    cell: ({ row }) => {
      const video = row.original;

      return video.date.toLocaleDateString("fr-BE", options);
    },
  },
  {
    id: "actions",
    cell: (props) => <VideosRowActions row={props.row} />,
  },
];
