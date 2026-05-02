export async function getResponseMessage(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body?.error ?? body?.message ?? fallback;
  } catch {
    return fallback;
  }
}
