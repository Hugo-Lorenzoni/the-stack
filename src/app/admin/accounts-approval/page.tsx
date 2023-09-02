import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getWaitingUsers } from "@/utils/getWaitingUsers";
import { User } from "@prisma/client";

export default async function AccountsApprovalPage() {
  const users = await getWaitingUsers();

  const data: User[] = users.map((user: User) => {
    const { id, autreCercle, cercleVille, cercle, ...result } = user;
    if (cercle == "AUTRE") {
      return {
        id: id.substring(0, 8),
        ...result,
        cercle: autreCercle ? autreCercle : "Undefined",
        ville: cercleVille ? cercleVille : "Undefined",
      };
    } else {
      return {
        id: id.substring(0, 8),
        ...result,
        cercle: cercle ? cercle : "Undefined",
        ville: "Mons",
      };
    }
  });

  return (
    <section>
      <h2 className="pb-4">Accounts Approval Page</h2>
      <DataTable columns={columns} data={data} />
    </section>
  );
}
