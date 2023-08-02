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
        <SearchX className="w-20 h-20 mt-24 mx-auto" />
        <p className="mt-2 mx-auto w-fit">Aucun résultat...</p>
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
      <ul className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {results.map((event) => {
          const date = new Date(event.date);
          return (
            <li
              key={event.id}
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl duration-200"
            >
              <Link
                href={`/admin/events/${event.id}`}
                className="relative isolate"
              >
                <div className="absolute text-white bottom-4 left-5 font-semibold text-lg drop-shadow-eventtitle z-10 mr-5">
                  <h2>{event.title}</h2>
                  <p>{date.toLocaleDateString("fr-BE", options)}</p>
                </div>
                {event.published == false && (
                  <TextSelect className="absolute top-4 left-4 text-white z-10 drop-shadow-eventtitle" />
                )}
                <div className="absolute top-4 right-4 text-white z-10 drop-shadow-eventtitle flex gap-2">
                  {event.type == "AUTRE" && <Lock />}
                  {event.type == "OUVERT" && <Users2 />}
                  {event.type == "BAPTISE" && <BadgeCheck />}
                  {event.pinned && <Pin className="rotate-45" />}
                </div>

                <Image
                  className="w-full h-full object-cover scale-105 group-hover:scale-110 duration-200 "
                  src={event.coverUrl}
                  width={event.coverWidth}
                  height={event.coverHeight}
                  alt={event.coverName}
                  quality={30}
                />
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2 justify-between items-center mt-4">
        <Button
          disabled={currentPage == 1}
          onClick={() => setCurrentPage((page) => page - 1)}
        >
          Précédant
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