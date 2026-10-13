/**
 * Shared server helpers for the Thoth Weather Oracle API.
 *
 * The same code serves two runtimes:
 *  - the local Express dev server (server.ts), and
 *  - Vercel Serverless Functions (the api directory), which use the Node-style
 *    (req, res) handler signature.
 *
 * Keeping the Gemini client factory here guarantees identical behaviour —
 * including the heuristic fallbacks when GEMINI_API_KEY is absent — in
 * both environments.
 */
import { GoogleGenAI } from '@google/genai';

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

let cachedClient: GoogleGenAI | null | undefined;

/**
 * Lazily builds the shared Gemini client from GEMINI_API_KEY.
 * Returns null when no key is configured — callers must serve their
 * heuristic fallback in that case.
 */
export function getGeminiClient(): GoogleGenAI | null {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.GEMINI_API_KEY;
  cachedClient = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;
  return cachedClient;
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
