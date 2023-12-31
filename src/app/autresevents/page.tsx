import Link from "next/link";
import Image from "next/image";
import PaginationControls from "@/components/PaginationControls";

import { getEventsCount } from "@/utils/getEventsCount";
import { getEvents } from "@/utils/getEvents";
import { Pin } from "lucide-react";

export default async function AutresEventsPage({
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

  const count = await getEventsCount("AUTRE");
  const events = await getEvents(page.toString(), eventPerPage, "AUTRE");
  // console.log(events.length);

  // console.log(events);
  // console.log(searchParams);
  // console.log(events.length);
  // console.log(count;
  // console.log(Number(page) * eventPerPage);

  return (
    <main className="container my-8 min-h-[calc(100vh_-_10rem)]">
      <h1 className="relative w-fit text-2xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
        Autres événements
      </h1>
      {events ? (
        <>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="group overflow-hidden rounded-2xl shadow-lg duration-200 hover:shadow-xl"
              >
                <Link href={`/autresevents/${event.id}`}>
                  <div className="relative isolate">
                    <div className="absolute bottom-4 left-5 z-10 mr-5 text-lg font-semibold text-white drop-shadow-eventtitle">
                      <h2>{event.title}</h2>
                      <p>{event.date.toLocaleDateString("fr-BE", options)}</p>
                    </div>
                    {event.pinned && (
                      <Pin className="absolute right-4 top-4 z-10 rotate-45 text-white drop-shadow-eventtitle" />
                    )}
                    <Image
                      className="relative -z-10 h-full w-full scale-105 object-cover duration-200 group-hover:scale-110"
                      src={event.coverUrl}
                      width={event.coverWidth}
                      height={event.coverHeight}
                      alt={event.coverName}
                      quality={10}
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
