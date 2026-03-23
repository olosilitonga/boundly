/**
 * aiClient.js — AI API Client
 * Boundly / Hackonomics Project
 *
 * Handles the raw fetch call to the AI API.
 * Kept separate from prompt logic and suggestion logic
 * so each file has one clear job.
 */

// ─── Config ───────────────────────────────────────────────────────────────────

// AI API endpoint — using OpenRouter so you can swap models easily
// Sign up free at https://openrouter.ai to get an API key
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "mistralai/mistral-7b-instruct"; // free tier model on OpenRouter

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Sends a prompt to the AI API and returns the response text.
 *
 * @param {string} prompt     - The full prompt string to send
 * @param {string} apiKey     - Your OpenRouter API key
 * @returns {Promise<string>} - The AI's raw text response
 */
async function callAI(prompt, apiKey) {
    // Step 1 — Validate inputs before making the request
    if (!prompt || typeof prompt !== "string") {
        throw new Error("callAI: prompt must be a non-empty string.");
    }
    if (!apiKey || typeof apiKey !== "string") {
        throw new Error("callAI: apiKey must be a non-empty string.");
    }

    // Step 2 — Build the request
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,  // slightly creative but still consistent
            max_tokens: 300,  // short focused response
        }),
    });

    // Step 3 — Handle HTTP errors
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`AI API error ${response.status}: ${errorBody}`);
    }

    // Step 4 — Extract the text content from the response
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error("AI API returned an empty response.");
    }

    return text.trim();
}

// ─── Export ───────────────────────────────────────────────────────────────────

export { callAI };

// CommonJS alternative:
// module.exports = { callAI };
