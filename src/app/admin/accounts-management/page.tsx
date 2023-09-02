import { User } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllUsers } from "@/utils/getAllUsers";

export default async function AccountsManagementPage() {
  const users = await getAllUsers();
  const data: User[] = users.map((user: User) => {
    const { cercle, autreCercle, ...result } = user;
    if (cercle == "AUTRE") {
      return {
        ...result,
        cercle: autreCercle ? autreCercle : "Undefined",
      };
    } else if (!cercle) {
      return {
        ...result,
        cercle: "/",
      };
    } else {
      return {
        ...result,
        cercle: cercle,
      };
    }
  });
  return (
    <section>
      <h2 className="pb-4">Accounts Management Page</h2>
      <DataTable columns={columns} data={data} />
    </section>
  );
}
