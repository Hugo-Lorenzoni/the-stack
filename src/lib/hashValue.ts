import crypto from 'crypto';

/**
 * One-way SHA-256 hash of a string value for safe logging of sensitive inputs
 * (e.g. search terms, email addresses) without exposing the raw value.
 *
 * Returns the first 16 hex characters — enough to correlate log entries
 * without reconstructing the original value.
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}
