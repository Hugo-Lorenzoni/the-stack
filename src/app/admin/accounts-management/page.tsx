import { Cercle, Role } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllUsers } from "@/utils/getAllUsers";
import { getRequestLogger } from "@/lib/getRequestLogger";

type Data = {
  email: string;
  name: string;
  surname: string;
  role: Role;
  cercle: Cercle | string | null;
  createdAt: Date;
};

export default async function AccountsManagementPage() {
  const { wideEvent, emit } = await getRequestLogger("/admin/accounts-management");

  let data: Data[] = [];

  try {
    const users = await getAllUsers();
    data = users.map((user) => {
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
      <h2 className="pb-4">Accounts Management Page</h2>
      <DataTable columns={columns} data={data} />
    </section>
  );
}
