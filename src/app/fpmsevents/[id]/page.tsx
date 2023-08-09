import { getFPMsEvent } from "@/utils/getFPMsEvent";
import Gallery from "@/components/Gallery";

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getFPMsEvent(params.id);
  console.log(event);

  return (
    <main className="container min-h-[calc(100vh_-_10rem)] my-8">
      {event ? (
        <>
          <h1 className="font-semibold text-3xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
            {event.title}
          </h1>
          <p className="mt-4 text-right italic">{event.photos.length} photos</p>
          {event.notes && <p className="mt-4">{event.notes}</p>}
          <Gallery eventName={event.title} photos={event.photos} />
        </>
      ) : (
        <></>
      )}
    </main>
  );
}
