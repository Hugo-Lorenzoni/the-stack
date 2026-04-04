import SearchPagination from "@/app/search/SearchPagination";
import { getSearchedEvents } from "@/utils/getSearchedEvents";
import { getRequestLogger } from "@/lib/getRequestLogger";

export default async function SearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { wideEvent, emit } = await getRequestLogger("/search");

  const searchParams = await props.searchParams;
  const search = searchParams["q"] ?? "";

  let results: Awaited<ReturnType<typeof getSearchedEvents>> = [];

  try {
    results = await getSearchedEvents(search.toString());
    wideEvent.outcome = "success";
    wideEvent.query = search.toString();
    wideEvent.result_count = results.length;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    wideEvent.outcome = "error";
    wideEvent.error = { message: error.message, type: error.name };
    throw err;
  } finally {
    emit();
  }

  return <SearchPagination events={results} />;
}
