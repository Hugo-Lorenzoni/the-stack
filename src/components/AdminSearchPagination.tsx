"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  BadgeCheck,
  Lock,
  Pin,
  SearchX,
  TextSelect,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { Type } from "@prisma/client";

type Event = {
  id: string;
  title: string;
  date: Date;
  published: boolean;
  pinned: boolean;
  coverName: string;
  coverUrl: string;
  coverWidth: number;
  coverHeight: number;
  type: Type;
  password: string | null;
  publishDate: Date;
};

export default function AdminSearchPagination(props: {
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
          return (
            <li
              key={event.id}
              className="group overflow-hidden rounded-2xl shadow-lg duration-200 hover:shadow-xl"
            >
              <Link href={`/admin/events/${event.id}`}>
                <div className="relative isolate">
                  <div className="absolute bottom-4 left-5 z-10 mr-5 text-lg font-semibold text-white drop-shadow-eventtitle">
                    <h2>{event.title}</h2>
                    <p>{date.toLocaleDateString("fr-BE", options)}</p>
                  </div>
                  {event.published == false && (
                    <TextSelect className="absolute left-4 top-4 z-10 text-white drop-shadow-eventtitle" />
                  )}
                  <div className="absolute right-4 top-4 z-10 flex gap-2 text-white drop-shadow-eventtitle">
                    {event.type == "AUTRE" && <Lock />}
                    {event.type == "OUVERT" && <Users2 />}
                    {event.type == "BAPTISE" && <BadgeCheck />}
                    {event.pinned && <Pin className="rotate-45" />}
                  </div>

                  <Image
                    className="h-full w-full scale-105 object-cover duration-200 group-hover:scale-110 "
                    src={event.coverUrl}
                    width={event.coverWidth}
                    height={event.coverHeight}
                    alt={event.coverName}
                    quality={10}
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
