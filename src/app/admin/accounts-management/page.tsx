import { Cercle, Role } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllUsers } from "@/utils/getAllUsers";

type User = {
  role: Role;
  name: string;
  email: string;
  surname: string;
  cercle: Cercle | null;
  autreCercle: string | null;
};

type Data = {
  email: string;
  name: string;
  surname: string;
  role: Role;
  cercle: Cercle | string | null;
};

export default async function AccountsManagementPage() {
  const users = await getAllUsers();
  const data: Data[] = users.map((user: User) => {
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
