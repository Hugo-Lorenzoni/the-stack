import prisma from "@/lib/prisma";
import { DataTable } from "./data-table";
import { User, columns } from "./columns";

export default async function AccountsApprovalPage() {
  const users = await prisma.user.findMany({
    where: {
      role: "WAITING",
    },
    select: {
      email: true,
      name: true,
      surname: true,
      cercle: true,
      autreCercle: true,
      cercleVille: true,
      promo: true,
    },
  });

  const data: User[] = users.map((user) => {
    const { autreCercle, cercleVille, cercle, ...result } = user;
    if (cercle == "AUTRE") {
      return {
        ...result,
        cercle: autreCercle ? autreCercle : "Undefined",
        ville: cercleVille ? cercleVille : "Undefined",
      };
    } else {
      return {
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
