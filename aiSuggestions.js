/**
 * aiSuggestions.js — AI Suggestion Orchestrator
 * Boundly / Hackonomics Project
 *
 * Connects the prompt builder, API client, and JSON parser
 * into one clean function the rest of the app can call.
 */

import { buildSuggestionPrompt } from "./prompts.js";
import { callAI }                from "./aiClient.js";

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Generates an AI-powered suggestion for a social outing.
 *
 * @param {{
 *   weeklyBudget:   number,
 *   estimatedCost:  number,
 *   percentageUsed: number,
 *   riskLevel:      "low" | "medium" | "high",
 *   category:       string
 * }} data
 *
 * @param {string} apiKey - Your OpenRouter API key
 *
 * @returns {Promise<{
 *   explanation:     string,
 *   recommendation:  string,
 *   politeMessage:   string
 * }>}
 */
async function getAISuggestion(data, apiKey) {
  // Step 1 — Build the prompt from the user's financial data
  const prompt = buildSuggestionPrompt(data);

  // Step 2 — Send to AI and get raw text back
  const rawText = await callAI(prompt, apiKey);

  // Step 3 — Parse the JSON response safely
  const result = parseAIResponse(rawText);

  return result;
}

// ─── JSON Parser ──────────────────────────────────────────────────────────────

/**
 * Safely parses the AI's JSON response.
 * Strips markdown code fences if the AI included them.
 * Falls back to a default response if parsing fails.
 *
 * @param {string} rawText
 * @returns {{ explanation: string, recommendation: string, politeMessage: string }}
 */
function parseAIResponse(rawText) {
  try {
    // Strip ```json ... ``` or ``` ... ``` wrappers if AI added them
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validate that all expected fields exist
    if (!parsed.explanation || !parsed.recommendation || !parsed.politeMessage) {
      throw new Error("Missing fields in AI response.");
    }

    return {
      explanation:    parsed.explanation,
      recommendation: parsed.recommendation,
      politeMessage:  parsed.politeMessage,
    };

  } catch (error) {
    console.warn("Boundly: AI response parse failed, using fallback.", error);

    // Fallback — return a safe default if AI output is malformed
    return {
      explanation:    "We couldn't get an AI response right now.",
      recommendation: "Use the risk analysis above as your guide.",
      politeMessage:  "Hey, let me check my schedule and get back to you!",
    };
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export { getAISuggestion };

// CommonJS alternative:
// module.exports = { getAISuggestion };

// ─── Usage Example ────────────────────────────────────────────────────────────

// import { getAISuggestion } from "./aiSuggestions.js";
//
// const result = await getAISuggestion(
//   {
//     weeklyBudget:   50,
//     estimatedCost:  35,
//     percentageUsed: 70,
//     riskLevel:      "high",
//     category:       "casual dining",
//   },
//   "your-openrouter-api-key"
// );
//
// console.log(result);
// → {
//     explanation:    "This outing would use 70% of your weekly fun budget...",
//     recommendation: "Consider suggesting a cheaper alternative like coffee instead.",
//     politeMessage:  "I'd love to but I'm keeping it tight this week — rain check?"
//   }
