import Gallery from "@/components/Gallery";
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
          <Gallery photos={event.photos} />
        </>
      ) : (
        <></>
      )}
    </main>
  );
}
