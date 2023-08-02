import Link from "next/link";
import Image from "next/image";

import { getAdminEvents } from "@/utils/getAdminEvents";
import { Pin } from "lucide-react";
import AdminSearchBar from "@/components/AdminSearchBar";

export default async function EventsManagementPage() {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const events = await getAdminEvents();
  // console.log(events.length);

  // console.log(events);
  // console.log(searchParams);
  // console.log(events.length);
  // console.log(count;
  // console.log(Number(page) * eventPerPage);

  return (
    <>
      {events ? (
        <>
          <h3 className="mt-4 font-semibold text-xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
            Dernières publications :
          </h3>
          <ul className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl duration-200"
              >
                <Link href={`/admin/events/${event.id}`}>
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
        </>
      ) : (
        <></>
      )}
    </>
  );
}
