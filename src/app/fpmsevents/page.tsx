import prisma from "@/lib/prisma";

export default async function EventPage() {
  const events = await prisma.event.findMany({
    where: {
      type: "BAPTISE",
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
  console.log(events);

  return (
    <main className="container min-h-[calc(100vh_-_10rem)] my-8">
      <h1 className="font-semibold text-2xl">Événements baptisés</h1>
    </main>
  );
}
