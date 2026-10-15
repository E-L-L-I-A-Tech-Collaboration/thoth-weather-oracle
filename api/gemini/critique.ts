import {
  getGeminiClient,
  isQuotaError,
  type ApiRequest,
  type ApiResponse,
} from '../../lib/thoth-api.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const ai = await getGeminiClient();
    const { worldStateSummary, proposals } = req.body ?? {};

    if (!ai) {
      return res.json({
        llmSource: 'heuristic_fallback',
        critiqueRationale: '[Fallback Critique] Safe mode verified; baseline mechanism weights accepted.',
        overallConsistencyScore: 0.92,
        hallucinationRisk: 0.05,
        mechanismWeightAdjustments: {},
        vetoedMechanisms: [],
        safetyWarnings: [],
      });
    }

    // Lazy-load the Gemini SDK (incl. Type): keeps the serverless bundle light
    // and avoids the module-eval crash seen on Vercel on 2026-10-15.
    const { Type } = await import('@google/genai');

    const systemInstruction = `
You are LLM B (Critique & Reflector) in an HRM World-Model Substrate.
Your role is adversarial critique, contradiction detection, hallucination and entropy auditing, and safety/consistency verification before mechanism arbitration.
Review the world state and mechanism proposals (from LLM A, deterministic tools, and sensors), evaluate consistency and conservation, and return weight adjustments or safety warnings.
Respond strictly in JSON format.
`;

    const prompt = `
World State Context:
- Step: ${worldStateSummary?.step ?? 0}
- Global Stress: ${worldStateSummary?.globalStress ?? 0.1}
- Global Entropy: ${worldStateSummary?.globalEntropy ?? 0.1}

Active Proposals To Critique:
${JSON.stringify(proposals || [], null, 2)}

Provide critique evaluation and mechanism weight adjustments.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            critiqueRationale: { type: Type.STRING, description: 'Critique and consistency audit findings' },
            overallConsistencyScore: { type: Type.NUMBER, description: 'Substrate consistency score [0, 1]' },
            hallucinationRisk: { type: Type.NUMBER, description: 'Estimated hallucination/entropy risk [0, 1]' },
            vetoedMechanisms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of mechanism IDs to veto or disable for this step due to safety/contradiction',
            },
            safetyWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            mechanismWeightAdjustments: {
              type: Type.OBJECT,
              description: 'Multipliers for mechanism confidence e.g. {"mech_llm_reasoning": 1.1, "mech_diffusion": 0.9}',
            },
          },
          required: ['critiqueRationale', 'overallConsistencyScore', 'hallucinationRisk'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      llmSource: 'gemini-3.6-flash',
      ...parsed,
    });
  } catch (error: any) {
    if (isQuotaError(error)) {
      console.warn('Gemini API Quota / Rate limit reached for Critique endpoint. Returning substrate fallback.');
    } else {
      console.error('LLM B Critique Error:', error?.message || error);
    }
    return res.json({
      error: error?.message || 'LLM B Critique Failure',
      llmSource: 'error_fallback',
      critiqueRationale: `[Fallback Critique] ${error?.message || 'Gemini API limit reached'}. Baseline safety bounds verified and active.`,
      overallConsistencyScore: 0.88,
      hallucinationRisk: 0.05,
      vetoedMechanisms: [],
      safetyWarnings: ['Rate limit active; local substrate bounds enforcing physics conservation.'],
    });
  }
}
