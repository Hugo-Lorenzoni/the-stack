import { headers } from "next/headers";
import { cache } from "react";

export const getSearchedEvents = cache(async (search: string) => {
  try {
    // console.log(headers());
    const headersList = headers();
    const cookie = headersList.get("cookie");
    if (!cookie) {
      return;
    }
    const url = `http://localhost:3000/api/search?q=${search}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        cookie: cookie,
      },
      // cache: "no-store",
      // headers: { "Content-Type": "application/json" },
      // next: { revalidate: 60 },
    });
    // console.log(response);

    const results = await response.json();
    return results;
  } catch (error) {
    console.log(error);
  }
});
