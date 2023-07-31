import { Event } from "@prisma/client";
import SearchPagination from "@/components/SearchPagination";
import { getSearchedEvents } from "@/utils/getSearchedEvents";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = searchParams["search"] ?? "";

  const response = await getSearchedEvents(search.toString());
  // console.log(response);
  const results: Event[] = await response.json();
  console.log(results);

  return (
    <main className="container min-h-[calc(100vh_-_10rem)] my-8">
      <h1 className="font-semibold text-2xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
        Résultats :
      </h1>
      <SearchPagination events={results} />
    </main>
  );
}
