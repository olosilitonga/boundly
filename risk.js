/**
 * risk.js — Financial Risk Evaluator
 * Hackonomics Project
 *
 * Evaluates how risky a social outing is relative to the user's weekly budget.
 * Also includes a transport cost estimator to factor in travel expenses.
 */

// ─── Transport Cost Estimator ─────────────────────────────────────────────────
// Estimates travel cost based on distance and mode of transport.
// Rates are based on US averages (AAA + Uber/Lyft data).

const TRANSPORT_RATES = {
    "own car": { base: 0, perKm: 0.21 },   // ~$0.21/km (fuel + wear)
    "uber/lyft": { base: 1.50, perKm: 0.90 }, // $1.50 base + $0.90/km
    "walking": { base: 0, perKm: 0 },       // free, assumed <= 2km
};

/**
 * Estimates one-way transport cost to venue.
 *
 * @param {number} distanceKm     - Distance to venue in kilometers
 * @param {string} transportMode  - "own car" | "uber/lyft" | "walking"
 * @param {boolean} roundTrip     - Whether to double the cost (default: true)
 * @returns {number} Estimated transport cost in USD
 */
function estimateTransportCost(distanceKm, transportMode = "uber/lyft", roundTrip = true) {
    // Validate distance
    if (typeof distanceKm !== "number" || distanceKm < 0) {
        throw new Error("Invalid input: distanceKm must be a non-negative number.");
    }

    const mode = TRANSPORT_RATES[transportMode.toLowerCase()];
    if (!mode) {
        throw new Error(`Unknown transport mode: "${transportMode}". Use "own car", "uber/lyft", or "walking".`);
    }

    // Walking is always free regardless of distance input
    if (transportMode.toLowerCase() === "walking") return 0;

    const oneWay = mode.base + mode.perKm * distanceKm;
    return parseFloat((roundTrip ? oneWay * 2 : oneWay).toFixed(2));
}

// ─── Risk Thresholds ──────────────────────────────────────────────────────────

const RISK_THRESHOLDS = {
    LOW: 20, // <= 20% of weekly budget → safe
    MEDIUM: 50, // > 20% and <= 50% → caution
    // > 50% → high risk
};

// ─── Risk Explanations ────────────────────────────────────────────────────────

const EXPLANATIONS = {
    low: "This plan uses a small portion of your weekly social budget.",
    medium: "This plan may significantly impact your weekly budget.",
    high: "This plan exceeds a safe portion of your budget.",
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Evaluates the financial risk of a social outing.
 *
 * @param {number} estimatedCost  - Total outing cost (venue + any transport)
 * @param {number} weeklyBudget   - User's weekly discretionary budget
 * @returns {{
 *   riskLevel: "low"|"medium"|"high",
 *   percentageUsed: number,
 *   remainingBudget: number,
 *   explanation: string
 * }}
 */
function calculateRisk(estimatedCost, weeklyBudget) {
    // Step 1 — Validate inputs: no negative values allowed
    if (typeof estimatedCost !== "number" || estimatedCost < 0) {
        throw new Error("Invalid input: estimatedCost must be a non-negative number.");
    }
    if (typeof weeklyBudget !== "number" || weeklyBudget < 0) {
        throw new Error("Invalid input: weeklyBudget must be a non-negative number.");
    }

    // Step 2 — Handle edge case: free outing → always low risk
    if (estimatedCost === 0) {
        return {
            riskLevel: "low",
            percentageUsed: 0,
            remainingBudget: weeklyBudget,
            explanation: EXPLANATIONS.low,
        };
    }

    // Step 3 — Handle edge case: zero or negative budget → always high risk
    if (weeklyBudget <= 0) {
        return {
            riskLevel: "high",
            percentageUsed: 100,
            remainingBudget: -estimatedCost,
            explanation: EXPLANATIONS.high,
        };
    }

    // Step 4 — Calculate percentage of weekly budget this outing would use
    const percentageUsed = Math.round((estimatedCost / weeklyBudget) * 100);

    // Step 5 — Determine risk level based on thresholds
    let riskLevel;
    if (percentageUsed <= RISK_THRESHOLDS.LOW) {
        riskLevel = "low";
    } else if (percentageUsed <= RISK_THRESHOLDS.MEDIUM) {
        riskLevel = "medium";
    } else {
        riskLevel = "high";
    }

    // Step 6 — Calculate remaining budget after outing
    const remainingBudget = parseFloat((weeklyBudget - estimatedCost).toFixed(2));

    return {
        riskLevel,
        percentageUsed,
        remainingBudget,
        explanation: EXPLANATIONS[riskLevel],
    };
}

// ─── Export ───────────────────────────────────────────────────────────────────

export { calculateRisk, estimateTransportCost };

// CommonJS alternative:
// module.exports = { calculateRisk, estimateTransportCost };

// ─── Test Cases ───────────────────────────────────────────────────────────────

// calculateRisk(10, 50)
// → { riskLevel: "low", percentageUsed: 20, remainingBudget: 40,
//     explanation: "This plan uses a small portion of your weekly social budget." }

// calculateRisk(30, 50)
// → { riskLevel: "medium", percentageUsed: 60, remainingBudget: 20,
//     explanation: "This plan may significantly impact your weekly budget." }

// calculateRisk(40, 50)
// → { riskLevel: "high", percentageUsed: 80, remainingBudget: 10,
//     explanation: "This plan exceeds a safe portion of your budget." }

// calculateRisk(20, 0)
// → { riskLevel: "high", percentageUsed: 100, remainingBudget: -20,
//     explanation: "This plan exceeds a safe portion of your budget." }

// ─── Transport Estimator Test Cases ──────────────────────────────────────────

// estimateTransportCost(10, "uber/lyft", true)
// → $19.50 (round trip, 10km each way)

// estimateTransportCost(10, "own car", true)
// → $4.20 (round trip, 10km each way)

// estimateTransportCost(5, "walking", true)
// → $0
