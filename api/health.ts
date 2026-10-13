import type { ApiRequest, ApiResponse } from '../lib/thoth-api';

export default async function handler(_req: ApiRequest, res: ApiResponse) {
  return res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
}
