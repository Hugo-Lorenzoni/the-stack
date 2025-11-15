"use client";

import { useState } from "react";
import { Lock, SearchX } from "lucide-react";
import Link from "@/components/Link";
import { Type } from "@prisma/client";
import ImageComponent from "@/components/ImageComponent";
import { Button } from "@/components/ui/button";

type Event = {
  id: string;
  title: string;
  date: Date;
  pinned: boolean;
  type: Type;
  coverName: string;
  coverUrl: string;
  coverWidth: number;
  coverHeight: number;
};

export default function SearchPagination(props: {
  events: Event[] | undefined;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const events = props.events;

  if (!events || !events.length) {
    return (
      <>
        <SearchX className="mx-auto mt-24 h-20 w-20" />
        <p className="mx-auto mt-2 w-fit">Aucun résultat...</p>
      </>
    );
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const eventPerPage = 12;

  const start = (Number(currentPage) - 1) * Number(eventPerPage); // 0, 5, 10 ...
  const end = start + Number(eventPerPage); // 5, 10, 15 ...
  const results = events.slice(start, end);

  return (
    <>
      <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {results.map((event) => {
          const date = new Date(event.date);
          const pathMap: Record<Type, string> = {
            AUTRE: "autresevents",
            OUVERT: "events",
            BAPTISE: "fpmsevents",
          };
          const path = pathMap[event.type] || "";
          return (
            <li
              key={event.id}
              className="group overflow-hidden rounded-2xl shadow-lg duration-200 hover:shadow-xl"
            >
              <Link href={`/${path}/${event.id}`}>
                <div className="relative isolate h-full w-full">
                  <div className="drop-shadow-eventtitle absolute bottom-4 left-5 z-10 mr-5 text-lg font-semibold text-white">
                    <h2>{event.title}</h2>
                    <p>{date.toLocaleDateString("fr-BE", options)}</p>
                  </div>
                  {event.type == "AUTRE" && (
                    <Lock className="drop-shadow-eventtitle absolute top-4 right-4 z-10 text-white" />
                  )}
                  <ImageComponent
                    className="h-full w-full scale-105 object-cover duration-200 group-hover:scale-110"
                    src={event.coverUrl}
                    width={event.coverWidth}
                    height={event.coverHeight}
                    alt={event.coverName}
                    quality="thumbnail"
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          disabled={currentPage == 1}
          onClick={() => setCurrentPage((page) => page - 1)}
        >
          Précédent
        </Button>

        <div>
          {currentPage} / {Math.ceil(events.length / eventPerPage)}
        </div>

        <Button
          disabled={currentPage >= Math.ceil(events.length / eventPerPage)}
          onClick={() => {
            setCurrentPage((page) => page + 1);
          }}
        >
          Suivant
        </Button>
      </div>
    </>
  );
}
