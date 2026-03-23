/**
 * recommendations.js — Financial Recommendation Generator
 * Hackonomics Project
 *
 * Generates friendly, supportive financial advice
 * based on the risk level of a social outing.
 */

// ─── Recommendation Templates ─────────────────────────────────────────────────
// Each risk level has its own set of messages.
// Tone: friendly, non-judgmental, supportive.

const RECOMMENDATIONS = {
    low: {
        summary: "You're in great shape for this one! 🟢",
        advice: "This outing fits comfortably within your weekly budget. Go ahead and enjoy it!",
        action: "Just keep an eye on any extra spending (drinks, tips, add-ons) so you stay on track.",
        politeMessage: "Sounds fun — count me in! 😊",
    },

    medium: {
        summary: "This one's doable, but worth a second look. 🟡",
        advice: "This outing will take up a noticeable chunk of your weekly budget. Consider setting a personal spending cap before you go.",
        action: "Look for a slightly cheaper option, skip extras like dessert or drinks, or suggest splitting costs with the group.",
        politeMessage: "I'm down! Can we maybe keep it on the lighter side budget-wise? 😄",
    },

    high: {
        summary: "This might stretch your budget too thin right now. 🔴",
        advice: "This outing could significantly impact your finances this week. It might be worth skipping or finding a more affordable alternative.",
        action: "Suggest a cheaper venue, propose a rain check for a better week, or offer a free/low-cost alternative hangout.",
        politeMessage: "I'd love to, but I'm watching my budget this week — can we find something a bit more low-key? 🙏",
    },
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Generates a financial recommendation based on risk level.
 *
 * @param {"low"|"medium"|"high"} riskLevel   - Risk level from calculateRisk()
 * @param {number}                percentageUsed - % of weekly budget this outing uses
 * @returns {{
 *   summary: string,
 *   advice: string,
 *   action: string,
 *   politeMessage: string
 * }}
 */
function getRecommendation(riskLevel, percentageUsed) {
    // Step 1 — Validate riskLevel
    const validLevels = ["low", "medium", "high"];
    if (!validLevels.includes(riskLevel)) {
        throw new Error(`Invalid riskLevel: "${riskLevel}". Must be "low", "medium", or "high".`);
    }

    // Step 2 — Validate percentageUsed
    if (typeof percentageUsed !== "number" || percentageUsed < 0) {
        throw new Error("Invalid input: percentageUsed must be a non-negative number.");
    }

    // Step 3 — Grab base recommendation for this risk level
    const base = RECOMMENDATIONS[riskLevel];

    // Step 4 — Personalize the summary with the actual percentage
    const personalizedSummary = `${base.summary} This plan uses about ${percentageUsed}% of your weekly social budget.`;

    return {
        summary: personalizedSummary,
        advice: base.advice,
        action: base.action,
        politeMessage: base.politeMessage,
    };
}

// ─── Export ───────────────────────────────────────────────────────────────────

export { getRecommendation };

// CommonJS alternative:
// module.exports = { getRecommendation };

// ─── Test Cases ───────────────────────────────────────────────────────────────

// getRecommendation("low", 15)
// → {
//     summary:       "You're in great shape for this one! 🟢 This plan uses about 15% of your weekly social budget.",
//     advice:        "This outing fits comfortably within your weekly budget. Go ahead and enjoy it!",
//     action:        "Just keep an eye on any extra spending (drinks, tips, add-ons) so you stay on track.",
//     politeMessage: "Sounds fun — count me in! 😊"
//   }

// getRecommendation("medium", 40)
// → {
//     summary:       "This one's doable, but worth a second look. 🟡 This plan uses about 40% of your weekly social budget.",
//     advice:        "This outing will take up a noticeable chunk of your weekly budget. Consider setting a personal spending cap before you go.",
//     action:        "Look for a slightly cheaper option, skip extras like dessert or drinks, or suggest splitting costs with the group.",
//     politeMessage: "I'm down! Can we maybe keep it on the lighter side budget-wise? 😄"
//   }

// getRecommendation("high", 80)
// → {
//     summary:       "This might stretch your budget too thin right now. 🔴 This plan uses about 80% of your weekly social budget.",
//     advice:        "This outing could significantly impact your finances this week. It might be worth skipping or finding a more affordable alternative.",
//     action:        "Suggest a cheaper venue, propose a rain check for a better week, or offer a free/low-cost alternative hangout.",
//     politeMessage: "I'd love to, but I'm watching my budget this week — can we find something a bit more low-key? 🙏"
//   }
