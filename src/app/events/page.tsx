import Link from "next/link";
import Image from "next/image";
import PaginationControls from "@/components/PaginationControls";

import { getEventsCount } from "@/utils/getEventsCount";
import { getEvents } from "@/utils/getEvents";
import { Pin } from "lucide-react";
import ImageComponent from "@/components/ImageComponent";

export default async function EventsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams["page"] ?? "1";
  const eventPerPage = 12;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const count = await getEventsCount("OUVERT");
  const events = await getEvents(page.toString(), eventPerPage, "OUVERT");
  // console.log(events);
  // console.log(searchParams);
  // console.log(events.length);
  // console.log(count;
  // console.log(Number(page) * eventPerPage);

  return (
    <main className="container my-8 min-h-[calc(100vh_-_10rem)]">
      <h1 className="relative w-fit text-2xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
        Événements ouverts
      </h1>
      {events ? (
        <>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="group overflow-hidden rounded-2xl shadow-lg duration-200 hover:shadow-xl"
              >
                <Link href={`/events/${event.id}`}>
                  <div className="relative isolate">
                    <div className="absolute bottom-4 left-5 z-10 mr-5 text-lg font-semibold text-white drop-shadow-eventtitle">
                      <h2>{event.title}</h2>
                      <p>{event.date.toLocaleDateString("fr-BE", options)}</p>
                    </div>
                    {event.pinned && (
                      <Pin className="absolute right-4 top-4 z-10 rotate-45 text-white drop-shadow-eventtitle" />
                    )}
                    <ImageComponent
                      className="relative -z-10 h-full w-full scale-105 object-cover duration-200 group-hover:scale-110"
                      src={event.coverUrl}
                      width={event.coverWidth}
                      height={event.coverHeight}
                      alt={event.coverName}
                      quality="thumbnail"
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
