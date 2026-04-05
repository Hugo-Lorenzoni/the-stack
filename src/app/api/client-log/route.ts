import { NextResponse } from "next/server";
import { withLogging } from "@/lib/withLogging";

type ClientLogPayload = {
  event?: unknown;
  page?: unknown;
  client_outcome?: unknown;
  reason_code?: unknown;
};

function asSafeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 100) return undefined;
  return trimmed;
}

export const POST = withLogging(async (req, { wideEvent }) => {
  wideEvent.action = "client_log";

  const body = (await req.json()) as ClientLogPayload;
  const event = asSafeString(body.event);
  const page = asSafeString(body.page);
  const clientOutcome = asSafeString(body.client_outcome);
  const reasonCode = asSafeString(body.reason_code);

  if (!event || !page) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  wideEvent.client_event = event;
  wideEvent.source_page = page;

  if (clientOutcome) {
    wideEvent.client_outcome = clientOutcome;
  }

  if (reasonCode) {
    wideEvent.reason_code = reasonCode;
  }

  return new NextResponse(null, { status: 204 });
});
