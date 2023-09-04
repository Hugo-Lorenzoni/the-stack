import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getWaitingUsers } from "@/utils/getWaitingUsers";
import { Cercle } from "@prisma/client";

type User = {
  id: string;
  name: string;
  email: string;
  surname: string;
  cercle: Cercle | null;
  cercleVille: string | null;
  autreCercle: string | null;
  promo: number | null;
};

type Data = {
  id: string;
  email: string;
  name: string;
  surname: string;
  cercle: Cercle | string;
  ville: string;
  promo: number | null;
};

export default async function AccountsApprovalPage() {
  const users = await getWaitingUsers();

  const data: Data[] = users.map((user: User) => {
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
