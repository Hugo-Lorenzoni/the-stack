import { getSponsors } from "@/utils/getSponsors";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function SponsorsManagementPage() {
  const sponsor = await getSponsors();

  return (
    <section>
      <h2 className="pb-4">Sponsors Management Page</h2>
      <DataTable columns={columns} data={sponsor} />
    </section>
  );
}
