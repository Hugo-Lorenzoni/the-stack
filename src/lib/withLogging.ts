import { NextRequest, NextResponse } from "next/server";
import { getNextAuthSession } from "@/utils/auth";
import { safeError, safeInfo } from "./logger";

export type WideEvent = Record<string, unknown>;

type RouteHandler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>>; wideEvent: WideEvent },
) => Promise<NextResponse | Response>;

export function withLogging(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    const startTime = Date.now();
    // crypto.randomUUID() uses the Web Crypto API global — available in Node 18+ and Edge.
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

    // flow_id allows callers to correlate multiple requests belonging to the
    // same logical operation (e.g. a multi-step wizard or background job).
    const flowId = req.headers.get("x-flow-id") ?? undefined;

    const wideEvent: WideEvent = {
      request_id: requestId,
      ...(flowId !== undefined && { flow_id: flowId }),
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.nextUrl.pathname,
    };

    let response: NextResponse | Response | undefined;

    try {
      const session = await getNextAuthSession();
      wideEvent.user = session?.user
        ? { id: session.user.id, role: session.user.role }
        : null;

      response = await handler(req, { ...ctx, wideEvent });

      wideEvent.status_code = response.status;
      wideEvent.outcome = response.status < 400 ? "success" : "error";
      return response;
    } catch (err) {
      let message: string;
      let type: string;
      if (err instanceof Error) {
        message = err.message;
        type = err.name;
      } else {
        try {
          message = String(err);
        } catch {
          message = "[unserializable]";
        }
        type = "Error";
      }
      wideEvent.status_code = 500;
      wideEvent.outcome = "error";
      wideEvent.error = { message, type };
      throw err;
    } finally {
      wideEvent.duration_ms = Date.now() - startTime;
      const isError =
        wideEvent.outcome === "error" &&
        (wideEvent.status_code === undefined ||
          (wideEvent.status_code as number) >= 500);
      if (isError) {
        safeError(wideEvent);
      } else {
        safeInfo(wideEvent);
      }
    }
  };
}
