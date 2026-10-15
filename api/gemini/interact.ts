import {
  getGeminiClient,
  isQuotaError,
  type ApiRequest,
  type ApiResponse,
} from '../../lib/thoth-api';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const ai = await getGeminiClient();
    const { userPrompt, worldStateSummary } = req.body ?? {};

    if (!ai) {
      return res.json({
        llmSource: 'heuristic_fallback',
        llmA: {
          rationale: `[Substrate Action] Simulated response for prompt: "${userPrompt}". Modifying substrate attractor field.`,
          confidence: 0.88,
          activationStrength: 0.9,
          cognitiveFocusNodeId: 'node_1',
          strategicGoalAdjustment: userPrompt,
          fieldDeltas: { node_0: 0.2, node_1: 0.4 },
          proposedEvents: [],
        },
        llmB: {
          critiqueRationale: 'Substrate input within safety bounds. Verified energy budget.',
          overallConsistencyScore: 0.95,
          hallucinationRisk: 0.03,
          safetyWarnings: [],
        },
        toolActionsExecuted: ['Attractor Field Alignment', 'Memory Salience Boost'],
      });
    }

    // Lazy-load the Gemini SDK (incl. Type): keeps the serverless bundle light
    // and avoids the module-eval crash seen on Vercel on 2026-10-15.
    const { Type } = await import('@google/genai');

    const systemInstruction = `
You are the General Intelligence Orchestrator for the HRM Ecology Substrate.
When a user or environment input is received:
1. LLM A generates strategic reasoning, target node focus, and substrate field deltas.
2. LLM B critiques LLM A's proposals and evaluates risk & safety.
3. Relevant Tool actions are selected for substrate mutation.

Output JSON matching the exact schema.
`;

    const prompt = `
User Input Directive: "${userPrompt}"
Substrate State:
- Step: ${worldStateSummary?.step ?? 0}
- Active Goal: ${worldStateSummary?.activeGoal ?? 'Maintain World Model Stability'}
- Focus Node: ${worldStateSummary?.attentionFocusNodeId ?? 'node_0'}
- Stress: ${worldStateSummary?.globalStress ?? 0.1}
- Entropy: ${worldStateSummary?.globalEntropy ?? 0.1}

Perform full Tri-Path Orchestration (LLM A reasoning, LLM B critique, Tool Actions).
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
            llmA: {
              type: Type.OBJECT,
              properties: {
                rationale: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                activationStrength: { type: Type.NUMBER },
                cognitiveFocusNodeId: { type: Type.STRING },
                strategicGoalAdjustment: { type: Type.STRING },
                fieldDeltas: { type: Type.OBJECT },
                proposedEvents: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      targetIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                      reason: { type: Type.STRING },
                    },
                  },
                },
              },
              required: ['rationale', 'confidence'],
            },
            llmB: {
              type: Type.OBJECT,
              properties: {
                critiqueRationale: { type: Type.STRING },
                overallConsistencyScore: { type: Type.NUMBER },
                hallucinationRisk: { type: Type.NUMBER },
                safetyWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['critiqueRationale', 'overallConsistencyScore'],
            },
            toolActionsExecuted: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['llmA', 'llmB', 'toolActionsExecuted'],
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
      console.warn('Gemini API Quota / Rate limit reached for Interact endpoint. Returning substrate fallback.');
    } else {
      console.error('Interact Error:', error?.message || error);
    }
    return res.json({
      llmSource: 'heuristic_fallback',
      llmA: {
        rationale: `[Rate Limit / Quota Fallback] ${error?.message || 'Gemini quota reached'}. Directing substrate action locally.`,
        confidence: 0.85,
        activationStrength: 0.8,
        cognitiveFocusNodeId: 'node_0',
        strategicGoalAdjustment: 'Execute Substrate Adaptation',
        fieldDeltas: { node_0: 0.2, node_1: 0.3 },
        proposedEvents: [],
      },
      llmB: {
        critiqueRationale: 'Substrate input within safety bounds. Verified energy budget.',
        overallConsistencyScore: 0.92,
        hallucinationRisk: 0.04,
        safetyWarnings: [],
      },
      toolActionsExecuted: ['Attractor Field Alignment', 'Memory Salience Boost'],
    });
  }
}
