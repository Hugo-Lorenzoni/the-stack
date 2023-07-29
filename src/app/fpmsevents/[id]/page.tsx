import prisma from "@/lib/prisma";

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.event.findUnique({
    where: {
      id: params.id,
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
      photos: true,
      sponsors: true,
    },
  });
  console.log(event);

  return <>Event page {JSON.stringify(event)}</>;
}
