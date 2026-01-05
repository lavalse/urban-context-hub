export type ApiErrorEnvelope = {
  error: string;
  message?: string;
  details?: Array<{ path?: string; reason?: string; message?: string }>;
};

export class ApiError extends Error {
  status: number;
  envelope?: ApiErrorEnvelope;
  rawBody?: string;

  constructor(args: { status: number; message: string; envelope?: ApiErrorEnvelope; rawBody?: string }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.envelope = args.envelope;
    this.rawBody = args.rawBody;
  }
}

/**
 * Decide API base URL.
 * - Dev: use Vite proxy (recommended) so UI can call "/api/..." without CORS.
 * - Prod: same-origin.
 */
function apiBaseUrl() {
  // keep empty to use same-origin + dev proxy
  return "";
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const url = `${apiBaseUrl()}${path}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  const hasJsonBody = typeof init?.json !== "undefined";
  const body = hasJsonBody ? JSON.stringify(init!.json) : init?.body;

  if (hasJsonBody) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body,
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    // try parse error envelope
    let envelope: ApiErrorEnvelope | undefined;
    let rawBody: string | undefined;

    try {
      if (isJson) {
        envelope = (await res.json()) as ApiErrorEnvelope;
      } else {
        rawBody = await res.text();
      }
    } catch {
      // ignore parse error
    }

    const message =
      envelope?.message ??
      envelope?.error ??
      rawBody ??
      `Request failed: ${res.status}`;

    throw new ApiError({ status: res.status, message, envelope, rawBody });
  }

  if (!isJson) {
    // Some APIs might return text; for now we treat it as error to keep contract strict
    const raw = await res.text();
    throw new ApiError({
      status: res.status,
      message: `Expected JSON response but got: ${contentType}`,
      rawBody: raw,
    });
  }

  return (await res.json()) as T;
}
