import AdminGallery from "@/app/admin/events/[id]/AdminGallery";
import Password from "@/app/admin/events/[id]/Password";
import { getAdminEvent } from "@/utils/getAdminEvent";

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getAdminEvent(params.id);
  // console.log(event);

  return (
    <main className="mt-8 min-h-[calc(100vh_-_10rem)]">
      {event ? (
        <>
          <h1 className="relative w-fit text-3xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
            {event.title}
          </h1>
          <p className="mt-4 text-right italic">{event.photos.length} photos</p>
          {event.notes && <p className="mt-4">{event.notes}</p>}
          {event.password && <Password password={event.password} />}
          <AdminGallery
            eventId={event.id}
            eventTitle={event.title}
            eventDate={event.date}
            eventPinned={event.pinned}
            eventType={event.type}
            eventPassword={event.password || undefined}
            eventPhotos={event.photos.sort((a, b) =>
              a.name.localeCompare(b.name),
            )}
            eventNotes={event.notes || undefined}
          />
        </>
      ) : (
        <></>
      )}
    </main>
  );
}
