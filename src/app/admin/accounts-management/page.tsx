import prisma from "@/lib/prisma";
import { User, columns } from "./columns";
import { DataTable } from "./data-table";

export default async function AccountsManagementPage() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      surname: true,
      role: true,
      cercle: true,
      autreCercle: true,
    },
  });
  const data: User[] = users.map((user) => {
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
