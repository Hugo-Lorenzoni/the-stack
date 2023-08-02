import AdminSearchPagination from "@/components/AdminSearchPagination";
import { getAdminSearchedEvents } from "@/utils/getAdminSearchedEvents";

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = searchParams["q"] ?? "";
  // console.log(search);

  const results = await getAdminSearchedEvents(search.toString());
  // console.log(results);

  return <AdminSearchPagination events={results} />;
}
