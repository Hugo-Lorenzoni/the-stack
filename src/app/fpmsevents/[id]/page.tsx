import { getFPMsEvent } from "@/utils/getFPMsEvent";
import Gallery from "@/components/Gallery";

export default async function EventPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const event = await getFPMsEvent(params.id);
  // console.log(event);

  if (!event) {
    return (
      <main className="container my-8 flex min-h-[calc(80vh-10rem)] flex-col justify-center text-center">
        <h1 className="relative mx-auto w-fit text-3xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
          Événement introuvable
        </h1>
        <p className="mt-4">
          L&apos;événement que vous recherchez n&apos;existe pas ou a été
          supprimé.
        </p>
      </main>
    );
  }

  return (
    <main className="container my-8 min-h-[calc(100vh-10rem)]">
      <h1 className="relative w-fit text-3xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
        {event.title}
      </h1>
      <p className="mt-4 text-right italic">{event.photos.length} photos</p>
      {event.notes && <p className="mt-4">{event.notes}</p>}
      <Gallery eventName={event.title} photos={event.photos} />
    </main>
  );
}
