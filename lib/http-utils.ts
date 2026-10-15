/**
 * Zero-dependency HTTP helpers for the Thoth Weather Oracle API.
 *
 * Split out from lib/thoth-api.ts on purpose: Vercel bundles every file in
 * `api/` as its own serverless function, and any route that value-imports a
 * module pulling in `@google/genai` at the top level crashes with
 * FUNCTION_INVOCATION_FAILED before its handler ever runs (observed
 * 2026-10-15 on /api/weather/open-meteo, /api/weather/axiom-seer and all four
 * /api/gemini/* routes). Everything in this file has no runtime imports, so
 * it is always safe to value-import from a serverless route.
 */

/** Minimal structural typing for a Node-style serverless request. */
export interface ApiRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: any;
}

/** Minimal structural typing for a Node-style serverless response. */
export interface ApiResponse {
  status(code: number): ApiResponse;
  json(data: unknown): unknown;
}

/** Read the first string value of a query parameter. */
export function queryParam(req: ApiRequest, name: string, fallback: string): string {
  const value = req.query[name];
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

/** True when a Gemini failure looks like quota / rate limiting. */
export function isQuotaError(error: any): boolean {
  return (
    error?.status === 429 ||
    (typeof error?.message === 'string' &&
      (error.message.includes('quota') || error.message.includes('429')))
  );
}
