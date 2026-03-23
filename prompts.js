/**
 * prompts.js — AI Prompt Builder
 * Boundly / Hackonomics Project
 *
 * Constructs the prompt sent to the AI api.
 */

/**
 * Builds the prompt string from the user's financial data.
 * @param {{
 *   weeklyBudget:   number,
 *   estimatedCost:  number,
 *   percentageUsed: number,
 *   riskLevel:      "low" | "medium" | "high",
 *   category:       string
 * }} data
 * @returns {string} The formatted prompt
 */
export function buildSuggestionPrompt(data) {
  return `You are a friendly, realistic financial advisor helping a young professional manage their budget.

Here is the financial situation for a social outing they were just invited to:
- Weekly fun budget: $${data.weeklyBudget.toFixed(2)}
- Outing category: "${data.category}"
- Estimated cost: $${data.estimatedCost.toFixed(2)}
- Budget impact: This uses ${data.percentageUsed}% of their weekly fun budget
- Risk level: ${data.riskLevel.toUpperCase()}

Based on this, return a JSON object with exactly these three keys:
1. "explanation": A concise 1-2 sentence explanation of the financial impact.
2. "recommendation": A concise 1-2 sentence recommendation on what to do (e.g., skip, go, or suggest a cheaper alternative).
3. "politeMessage": A short, friendly, and realistic text message they can copy-paste to reply to the invitation. Keep it natural and casual.

Respond ONLY with valid JSON. Do not include markdown wrapped code fences (like \`\`\`json) or any other text.`;
}
