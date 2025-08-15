import SearchPagination from "@/app/search/SearchPagination";
import { getSearchedEvents } from "@/utils/getSearchedEvents";

export default async function SearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams["q"] ?? "";
  // console.log(search);

  const results = await getSearchedEvents(search.toString());
  // console.log(results);

  return <SearchPagination events={results} />;
}
