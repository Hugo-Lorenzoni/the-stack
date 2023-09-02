import Link from "next/link";
import Image from "next/image";
import PaginationControls from "@/components/PaginationControls";
import { Event } from "@prisma/client";

import { getEventsCount } from "@/utils/getEventsCount";
import { getEvents } from "@/utils/getEvents";
import { Pin } from "lucide-react";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = searchParams["page"] ?? "1";
  const eventPerPage = 12;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const count = await getEventsCount("OUVERT");
  const events = await getEvents(page.toString(), eventPerPage, "OUVERT");
  // console.log(events.length);

  // console.log(events);
  // console.log(searchParams);
  // console.log(events.length);
  // console.log(count;
  // console.log(Number(page) * eventPerPage);

  return (
    <main className="container min-h-[calc(100vh_-_10rem)] my-8">
      <h1 className="font-semibold text-2xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
        Événements ouverts
      </h1>
      {events ? (
        <>
          <ul className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {events.map((event: Event) => (
              <li
                key={event.id}
                className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl duration-200"
              >
                <Link href={`/events/${event.id}`}>
                  <div className="relative isolate">
                    <div className="absolute text-white bottom-4 left-5 font-semibold text-lg drop-shadow-eventtitle z-10 mr-5">
                      <h2>{event.title}</h2>
                      <p>{event.date.toLocaleDateString("fr-BE", options)}</p>
                    </div>
                    {event.pinned && (
                      <Pin className="absolute top-4 right-4 text-white z-10 drop-shadow-eventtitle rotate-45" />
                    )}
                    <Image
                      className="w-full h-full object-cover scale-105 group-hover:scale-110 duration-200 -z-10 relative"
                      src={event.coverUrl}
                      width={event.coverWidth}
                      height={event.coverHeight}
                      alt={event.coverName}
                      quality={30}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <PaginationControls
            countEvents={count}
            eventPerPage={eventPerPage}
            hasNextPage={count > Number(page) * eventPerPage}
            hasPrevPage={Number(page) != 1}
          />
        </>
      ) : (
        <></>
      )}
    </main>
  );
}
