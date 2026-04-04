import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getDraftedEvents } from "@/utils/getDraftedEvents";
import { getRequestLogger } from "@/lib/getRequestLogger";
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
  const { wideEvent, emit } = await getRequestLogger("/admin/drafted-events");

  let data: Data[] = [];

  try {
    const events = await getDraftedEvents();

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    data = events.map((event) => {
      const date = new Date(event.date);
      return {
        ...event,
        date: date.toLocaleDateString("fr-BE", options),
      };
    });

    wideEvent.outcome = "success";
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    wideEvent.outcome = "error";
    wideEvent.error = { message: error.message, type: error.name };
    throw err;
  } finally {
    emit();
  }

  return (
    <section>
      <h2 className="pb-4">Event Publishing Page</h2>
      <DataTable columns={columns} data={data} />
    </section>
  );
}
