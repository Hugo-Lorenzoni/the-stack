import { getSponsors } from "@/utils/getSponsors";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function SponsorsManagementPage() {
  const { wideEvent, emit } = await getRequestLogger("/admin/sponsors-management");

  let sponsor: Awaited<ReturnType<typeof getSponsors>> = [];

  try {
    sponsor = await getSponsors();
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
      <h2 className="pb-4">Sponsors Management Page</h2>
      <DataTable columns={columns} data={sponsor} />
    </section>
  );
}
