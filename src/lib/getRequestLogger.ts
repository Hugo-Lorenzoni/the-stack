import { headers } from 'next/headers';
import { logger } from './logger';
import type { WideEvent } from './withLogging';

export type RequestLoggerContext = {
  wideEvent: WideEvent;
  emit:      () => void;
  startTime: number;
};

export async function getRequestLogger(page: string): Promise<RequestLoggerContext> {
  const headerStore = await headers();
  // crypto.randomUUID() uses the Web Crypto API global — available in Node 18+ and Edge.
  const requestId   = headerStore.get('x-request-id') ?? crypto.randomUUID();
  const startTime   = Date.now();

  const wideEvent: WideEvent = {
    request_id:  requestId,
    timestamp:   new Date().toISOString(),
    page,
    render_type: 'ssr',
  };

  function emit() {
    wideEvent.duration_ms = Date.now() - startTime;
    logger.info(wideEvent);
  }

  return { wideEvent, emit, startTime };
}
