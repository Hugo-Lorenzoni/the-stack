import Image from "next/image";
import { getEvent } from "@/utils/getEvent";

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);
  console.log(event);

  return (
    <main className="container min-h-[calc(100vh_-_10rem)] my-8">
      {event ? (
        <>
          <h1 className="font-semibold text-2xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
            {event.title}
          </h1>
          <ul className="mt-8 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {event.photos.map((photo) => (
              <Image
                key={photo.id}
                className={
                  photo.width < photo.height
                    ? "row-span-2 w-full h-full object-cover rounded-md"
                    : "w-full h-full object-cover rounded-md"
                }
                src={photo.url}
                width={photo.width}
                height={photo.height}
                alt={photo.name}
                quality={30}
              />
            ))}
          </ul>
        </>
      ) : (
        <></>
      )}
    </main>
  );
}
