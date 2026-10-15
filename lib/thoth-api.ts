/**
 * Shared server helpers for the Thoth Weather Oracle API.
 *
 * The same code serves two runtimes:
 *  - the local Express dev server (server.ts), and
 *  - Vercel Serverless Functions (the api directory), which use the Node-style
 *    (req, res) handler signature.
 *
 * IMPORTANT: `@google/genai` is loaded lazily inside getGeminiClient(), never
 * at module top level. Vercel evaluates each api/*.ts file as its own
 * function bundle, and a static top-level import of the SDK crashed every
 * importing route with FUNCTION_INVOCATION_FAILED on 2026-10-15. Lazy loading
 * also means routes that never call getGeminiClient() (weather feeds) pay
 * zero SDK cost at cold start.
 */

import type { GoogleGenAI } from '@google/genai';
export type { ApiRequest, ApiResponse } from './http-utils.js';
export { isQuotaError, queryParam } from './http-utils.js';

let cachedClient: GoogleGenAI | null | undefined;

/**
 * Lazily builds the shared Gemini client from GEMINI_API_KEY.
 * Returns null when no key is configured — callers must serve their
 * heuristic fallback in that case.
 */
export async function getGeminiClient(): Promise<GoogleGenAI | null> {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    cachedClient = null;
    return cachedClient;
  }
  const { GoogleGenAI } = await import('@google/genai');
  cachedClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return cachedClient;
}
