import { headers } from "next/headers";
import { cache } from "react";

export const getSearchedEvents = cache(
  async (search: string, wideEvent?: Record<string, unknown>) => {
    const start = Date.now();
    try {
      const headersList = await headers();
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
      });

      const results = await response.json();

      if (wideEvent) {
        wideEvent.get_searched_events = {
          duration_ms: Date.now() - start,
          count: Array.isArray(results) ? results.length : 0,
          search,
        };
      }

      return results;
    } catch (error) {
      if (wideEvent) {
        const err = error instanceof Error ? error : new Error(String(error));
        wideEvent.get_searched_events = {
          duration_ms: Date.now() - start,
          error: { message: err.message, type: err.name },
          search,
        };
      }
    }
  },
);
