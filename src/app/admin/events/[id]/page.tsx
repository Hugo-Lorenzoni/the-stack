import AdminGallery from "@/components/AdminGallery";
import { getAdminEvent } from "@/utils/getAdminEvent";

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getAdminEvent(params.id);
  console.log(event);

  return (
    <main className="min-h-[calc(100vh_-_10rem)] my-8">
      {event ? (
        <>
          <h1 className="font-semibold text-3xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
            {event.title}
          </h1>
          <p className="mt-4 text-right italic">{event.photos.length} photos</p>
          <AdminGallery eventName={event.title} photos={event.photos} />
        </>
      ) : (
        <></>
      )}
    </main>
  );
}
