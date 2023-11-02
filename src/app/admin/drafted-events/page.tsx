import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getDraftedEvents } from "@/utils/getDraftedEvents";
import { Type } from "@prisma/client";

export const dynamic = "force-dynamic";

type Data = {
  id: string;
  title: string;
  date: string;
  pinned: boolean;
  type: Type;
};

export default async function AccountsApprovalPage() {
  const events = await getDraftedEvents();

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const data: Data[] = events.map((event) => {
    const date = new Date(event.date);
    return {
      ...event,
      date: date.toLocaleDateString("fr-BE", options),
    };
  });

  return (
    <section>
      <h2 className="pb-4">Event Publishing Page</h2>
      <DataTable columns={columns} data={data} />
    </section>
  );
}
