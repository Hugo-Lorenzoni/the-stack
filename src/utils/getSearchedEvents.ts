import { headers } from "next/headers";
import { cache } from "react";

export const getSearchedEvents = cache(async (search: string) => {
  const apiUrlEndpoint = `http://localhost:3000/api/search?search=${search}`;
  const postData = {
    method: "GET",
    headers: headers(),
    next: { revalidate: 60 },
  };
  const response = await fetch(apiUrlEndpoint, postData);
  return response;
});
