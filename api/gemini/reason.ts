import {
  getGeminiClient,
  isQuotaError,
  type ApiRequest,
  type ApiResponse,
} from '../../lib/thoth-api.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const ai = await getGeminiClient();
    const { worldStateSummary, userPrompt } = req.body ?? {};

    if (!ai) {
      // Fallback response if key is missing
      return res.json({
        llmSource: 'heuristic_fallback',
        rationale:
          '[Fallback Reasoning] API Key not detected; executing local heuristic substrate adaptation.',
        confidence: 0.85,
        activationStrength: 0.75,
        fieldDeltas: {},
        cognitiveFocusNodeId: worldStateSummary?.attentionFocusNodeId || 'node_0',
        strategicGoalAdjustment: userPrompt ? `Orient toward: ${userPrompt}` : null,
        proposedEvents: [],
      });
    }

    // Lazy-load the Gemini SDK (incl. Type): keeps the serverless bundle light
    // and avoids the module-eval crash seen on Vercel on 2026-10-15.
    const { Type } = await import('@google/genai');

    const systemInstruction = `
You are LLM A (Reasoning Engine) inside an HRM (Hierarchical Resilient Model) World-Model Substrate.
Your function is general intelligence reasoning operating over the substrate's perception, memory, goals, uncertainty, and topology.
Analyze the current world state and user input, then output strategic reasoning proposals, target field deltas, cognitive focus shifts, and structural adaptation events.
Respond strictly in JSON format.
`;

    const prompt = `
Current World State Summary:
- Step: ${worldStateSummary?.step ?? 0}
- Active Goal: ${worldStateSummary?.activeGoal ?? 'Maintain World Model Stability'}
- Focus Node: ${worldStateSummary?.attentionFocusNodeId ?? 'node_0'}
- Global Stress: ${worldStateSummary?.globalStress ?? 0.1}
- Global Entropy / Uncertainty: ${worldStateSummary?.globalEntropy ?? 0.1}
- Active Nodes Count: ${worldStateSummary?.nodeCount ?? 12}
- Sensed Nodes / Observation: ${JSON.stringify(worldStateSummary?.observation || {})}
${userPrompt ? `- User Directive / Sensor Trigger: "${userPrompt}"` : ''}

Generate structured reasoning proposal with fieldDeltas, strategic goal adjustment, focus node, and proposed events.
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
            rationale: { type: Type.STRING, description: 'Strategic reasoning summary' },
            confidence: { type: Type.NUMBER, description: 'Confidence score between 0 and 1' },
            activationStrength: { type: Type.NUMBER, description: 'Activation strength between 0 and 1' },
            cognitiveFocusNodeId: { type: Type.STRING, description: 'Target node ID for attention focus' },
            strategicGoalAdjustment: { type: Type.STRING, description: 'Updated active goal or strategy' },
            fieldDeltas: {
              type: Type.OBJECT,
              description: 'Proposed scalar field delta per nodeId e.g. {"node_0": 0.1, "node_1": -0.05}',
            },
            proposedEvents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: 'e.g. EdgeHealing, SplitRegion, AddNode, AddEdge' },
                  targetIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reason: { type: Type.STRING },
                },
                required: ['type', 'reason'],
              },
            },
          },
          required: ['rationale', 'confidence', 'activationStrength'],
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
      console.warn('Gemini API Quota / Rate limit reached for Reason endpoint. Returning substrate fallback.');
    } else {
      console.error('LLM A Reasoning Error:', error?.message || error);
    }
    return res.json({
      error: error?.message || 'LLM A Reasoning Failure',
      llmSource: 'error_fallback',
      rationale: `[Rate Limit / Quota Fallback] ${error?.message || 'Gemini API limit reached'}. Substrate maintaining local physics equilibrium.`,
      confidence: 0.85,
      activationStrength: 0.75,
      cognitiveFocusNodeId: 'node_0',
      strategicGoalAdjustment: 'Maintain Substrate Stability',
      fieldDeltas: { node_0: 0.1, node_1: 0.2 },
      proposedEvents: [],
    });
  }
}
