"use client";

import { useEffect } from "react";

type ClientLogEvent = {
  event: string;
  page: string;
  client_outcome?: "success" | "error";
  reason_code?: string;
};

export function logClientEvent(payload: ClientLogEvent) {
  void fetch("/api/client-log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    keepalive: true,
    body: JSON.stringify(payload),
  });
}

export function useClientPageViewLogging(page: string) {
  useEffect(() => {
    logClientEvent({ event: "client.page_view", page });
  }, [page]);
}
