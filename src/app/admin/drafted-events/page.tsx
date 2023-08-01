import { DataTable } from "./data-table";
import { Event, columns } from "./columns";
import { getDraftedEvents } from "@/utils/getDraftedEvents";

export const dynamic = "force-dynamic";

export default async function AccountsApprovalPage() {
  const events = await getDraftedEvents();

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const data: Event[] = events.map((event) => {
    return {
      ...event,
      date: event.date.toLocaleDateString("fr-BE", options),
    };
  });

  return (
    <section>
      <h2 className="pb-4">Accounts Approval Page</h2>
      <DataTable columns={columns} data={data} />
    </section>
  );
}
