import Link from "next/link";
import { getAdminEvents } from "@/utils/getAdminEvents";
import { Pin } from "lucide-react";

type Event = {
  title: string;
  id: string;
  date: Date;
  pinned: boolean;
  coverName: string;
  coverUrl: string;
  coverWidth: number;
  coverHeight: number;
};

export default async function EventsManagementPage() {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const events = await getAdminEvents();

  return (
    <>
      {events ? (
        <>
          <h3 className="relative mt-4 w-fit text-xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
            Dernières publications :
          </h3>
          <ul className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {events.map((event: Event) => (
              <li
                key={event.id}
                className="group overflow-hidden rounded-2xl shadow-lg duration-200 hover:shadow-xl"
              >
                <Link href={`/admin/events/${event.id}`}>
                  <div className="relative isolate">
                    <div className="absolute bottom-4 left-5 z-10 mr-5 text-lg font-semibold text-white drop-shadow-eventtitle">
                      <h2>{event.title}</h2>
                      <p>{event.date.toLocaleDateString("fr-BE", options)}</p>
                    </div>
                    {event.pinned && (
                      <Pin className="absolute right-4 top-4 z-10 rotate-45 text-white drop-shadow-eventtitle" />
                    )}
                    <img
                      className="relative -z-10 h-full w-full scale-105 object-cover duration-200 group-hover:scale-110"
                      src={event.coverUrl}
                      width={event.coverWidth}
                      height={event.coverHeight}
                      alt={event.coverName}
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
