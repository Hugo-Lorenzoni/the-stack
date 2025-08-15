import AdminSearchPagination from "@/app/admin/events-management/search/AdminSearchPagination";
import { getAdminSearchedEvents } from "@/utils/getAdminSearchedEvents";

export default async function AdminSearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams["q"] ?? "";
  // console.log(search);

  const results = await getAdminSearchedEvents(search.toString());
  // console.log(results);

  return <AdminSearchPagination events={results} />;
}
