import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import PaginationControls from "@/components/PaginationControls";

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
  const countEvents = await prisma.event.count();
  const events = await prisma.event.findMany({
    skip: (Number(page) - 1) * eventPerPage,
    take: eventPerPage,
    where: {
      type: "AUTRE",
      published: true,
    },
    select: {
      id: true,
      title: true,
      date: true,
      pinned: true,
      coverName: true,
      coverUrl: true,
      coverWidth: true,
      coverHeight: true,
    },
    orderBy: [
      {
        pinned: "desc",
      },
      { date: "desc" },
    ],
  });
  // console.log(searchParams);

  //console.log(events);

  return (
    <main className="container min-h-[calc(100vh_-_10rem)] my-8">
      <h1 className="font-semibold text-2xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
        Autres événements
      </h1>
      {events ? (
        <>
          <ul className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl duration-200"
              >
                <Link
                  href={`/events/${event.id}`}
                  className="w-full h-full relative isolate"
                >
                  <div className="absolute text-white bottom-4 left-5 font-semibold text-lg drop-shadow-eventtitle z-10 mr-5">
                    <h2>{event.title}</h2>
                    <p>{event.date.toLocaleDateString("fr-BE", options)}</p>
                  </div>
                  {event.pinned && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute top-4 right-4 text-white z-10 drop-shadow-eventtitle"
                    >
                      <path
                        d="M9.62129 1.13607C9.81656 0.940808 10.1331 0.940809 10.3284 1.13607L11.3891 2.19673L12.8033 3.61094L13.8639 4.6716C14.0592 4.86687 14.0592 5.18345 13.8639 5.37871C13.6687 5.57397 13.3521 5.57397 13.1568 5.37871L12.5038 4.7257L8.86727 9.57443L9.97485 10.682C10.1701 10.8773 10.1701 11.1939 9.97485 11.3891C9.77959 11.5844 9.463 11.5844 9.26774 11.3891L7.85353 9.97491L6.79287 8.91425L3.5225 12.1846C3.32724 12.3799 3.01065 12.3799 2.81539 12.1846C2.62013 11.9894 2.62013 11.6728 2.81539 11.4775L6.08576 8.20714L5.0251 7.14648L3.61089 5.73226C3.41563 5.537 3.41562 5.22042 3.61089 5.02516C3.80615 4.8299 4.12273 4.8299 4.31799 5.02516L5.42557 6.13274L10.2743 2.49619L9.62129 1.84318C9.42603 1.64792 9.42603 1.33133 9.62129 1.13607Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                      <path
                        d="M9.62129 1.13607C9.81656 0.940808 10.1331 0.940809 10.3284 1.13607L11.3891 2.19673L12.8033 3.61094L13.8639 4.6716C14.0592 4.86687 14.0592 5.18345 13.8639 5.37871C13.6687 5.57397 13.3521 5.57397 13.1568 5.37871L12.5038 4.7257L8.86727 9.57443L9.97485 10.682C10.1701 10.8773 10.1701 11.1939 9.97485 11.3891C9.77959 11.5844 9.463 11.5844 9.26774 11.3891L7.85353 9.97491L6.79287 8.91425L3.5225 12.1846C3.32724 12.3799 3.01065 12.3799 2.81539 12.1846C2.62013 11.9894 2.62013 11.6728 2.81539 11.4775L6.08576 8.20714L5.0251 7.14648L3.61089 5.73226C3.41563 5.537 3.41562 5.22042 3.61089 5.02516C3.80615 4.8299 4.12273 4.8299 4.31799 5.02516L5.42557 6.13274L10.2743 2.49619L9.62129 1.84318C9.42603 1.64792 9.42603 1.33133 9.62129 1.13607Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                  <Image
                    className="w-full h-full object-cover scale-105 group-hover:scale-110 duration-200 "
                    src={event.coverUrl}
                    width={event.coverWidth}
                    height={event.coverHeight}
                    alt={event.coverName}
                  />
                </Link>
              </li>
            ))}
          </ul>
          <PaginationControls
            currentUrl="/events"
            countEvents={countEvents}
            eventPerPage={eventPerPage}
            hasNextPage={countEvents > Number(page) * eventPerPage}
            hasPrevPage={Number(page) != 1}
          />
        </>
      ) : (
        <></>
      )}
    </main>
  );
}
