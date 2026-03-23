/**
 * venuecosts.js — Venue & Category Cost Estimator
 * Hackonomics Project
 *
 * Estimates the cost of a social outing based on
 * a detected venue name or spending category.
 * Prices are estimated per person in USD (2025).
 */

// ─── Venue Cost Map ───────────────────────────────────────────────────────────
// Known venues with their estimated cost range (per person, in USD).
// Sources: official menus, FastFoodMenuPrices, LiveNOW/FOX avg meal data (2025).

const VENUE_COSTS = {
    // ── Fast Food ──────────────────────────────────────────────
    "in-n-out": { min: 12, max: 18, category: "fast food" },
    "mcdonalds": { min: 10, max: 15, category: "fast food" },
    "mcd": { min: 10, max: 15, category: "fast food" },
    "mcdonald": { min: 10, max: 15, category: "fast food" },
    "kfc": { min: 9, max: 15, category: "fast food" },
    "burger king": { min: 10, max: 16, category: "fast food" },
    "bk": { min: 10, max: 16, category: "fast food" },
    "jollibee": { min: 10, max: 18, category: "fast food" },
    "taco bell": { min: 8, max: 14, category: "fast food" },
    "subway": { min: 9, max: 15, category: "fast food" },
    "panda express": { min: 10, max: 16, category: "fast food" },
    "wingstop": { min: 14, max: 22, category: "fast food" },
    "dirty birds": { min: 14, max: 22, category: "fast food" },

    // ── Pizza ──────────────────────────────────────────────────
    "papa johns": { min: 12, max: 20, category: "pizza" },
    "papa john": { min: 12, max: 20, category: "pizza" },
    "dominos": { min: 10, max: 18, category: "pizza" },
    "domino": { min: 10, max: 18, category: "pizza" },

    // ── Casual Dining ──────────────────────────────────────────
    "cheesecake factory": { min: 28, max: 40, category: "casual dining" },
    "shake shack": { min: 12, max: 18, category: "casual dining" },
    "toroast": { min: 18, max: 30, category: "casual dining" },
    "toroast toronto": { min: 18, max: 30, category: "casual dining" },
    "big way": { min: 15, max: 25, category: "casual dining" },
    "curry up now": { min: 14, max: 22, category: "casual dining" },
    "lemongrass": { min: 15, max: 25, category: "casual dining" },
    "babi panggang": { min: 15, max: 28, category: "casual dining" },
    "nasi padang": { min: 12, max: 22, category: "casual dining" },

    // ── Cafe ───────────────────────────────────────────────────
    "starbucks": { min: 6, max: 10, category: "cafe" },
    "tim hortons": { min: 5, max: 12, category: "cafe" },
    "tim horton": { min: 5, max: 12, category: "cafe" },
    "timhortons": { min: 5, max: 12, category: "cafe" },
    "cha bar": { min: 8, max: 16, category: "cafe" },

    // ── Drinks ─────────────────────────────────────────────────
    "boba": { min: 7, max: 12, category: "drinks" },

    // ── Sushi ──────────────────────────────────────────────────
    "kibo sushi": { min: 20, max: 35, category: "sushi" },
    "kibo": { min: 20, max: 35, category: "sushi" },

    // ── Smoothies ──────────────────────────────────────────────
    "jamba": { min: 7, max: 12, category: "smoothies" },
    "jamba juice": { min: 7, max: 12, category: "smoothies" },
};

// ─── Category Fallback Map ────────────────────────────────────────────────────
// Used when no matching venue is found.
// Provides a general cost range per spending category.

const CATEGORY_COSTS = {
    "fast food": { min: 10, max: 18 },
    "pizza": { min: 10, max: 20 },
    "cafe": { min: 6, max: 12 },
    "drinks": { min: 7, max: 12 },
    "smoothies": { min: 7, max: 12 },
    "casual dining": { min: 20, max: 35 },
    "dining": { min: 18, max: 35 },
    "sushi": { min: 20, max: 40 },
    "entertainment": { min: 18, max: 30 },
    "brunch": { min: 20, max: 35 },
    "unknown": { min: 15, max: 25 },
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Estimates the cost of a social outing.
 *
 * @param {string|null} venue    - Detected venue name (or null if unknown)
 * @param {string}      category - Detected spending category
 * @returns {{
 *   source: "venue"|"category"|"default",
 *   venue: string|null,
 *   category: string,
 *   minCost: number,
 *   maxCost: number,
 *   averageCost: number
 * }}
 */
function estimateCost(venue, category) {
    // Step 1 — Normalize inputs to lowercase for consistent matching
    const normalizedVenue = venue ? venue.toLowerCase().trim() : null;
    const normalizedCategory = category ? category.toLowerCase().trim() : "unknown";

    // Step 2 — Try to match a known venue first (most specific)
    if (normalizedVenue && VENUE_COSTS[normalizedVenue]) {
        const data = VENUE_COSTS[normalizedVenue];
        return buildResult("venue", normalizedVenue, data.category, data.min, data.max);
    }

    // Step 3 — Fall back to category range
    if (CATEGORY_COSTS[normalizedCategory]) {
        const data = CATEGORY_COSTS[normalizedCategory];
        return buildResult("category", normalizedVenue, normalizedCategory, data.min, data.max);
    }

    // Step 4 — Nothing matched, use default "unknown" range
    const fallback = CATEGORY_COSTS["unknown"];
    return buildResult("default", normalizedVenue, "unknown", fallback.min, fallback.max);
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Builds the return object and calculates averageCost.
 */
function buildResult(source, venue, category, min, max) {
    return {
        source,
        venue,
        category,
        minCost: min,
        maxCost: max,
        averageCost: Math.round((min + max) / 2),
    };
}

// ─── Export ───────────────────────────────────────────────────────────────────

export { estimateCost };

// CommonJS alternative:
// module.exports = { estimateCost };

// ─── Test Cases ───────────────────────────────────────────────────────────────

// estimateCost("kfc", "fast food")
// → { source: "venue", venue: "kfc", category: "fast food", min: 9, max: 15, avg: 12 }

// estimateCost("tim hortons", "cafe")
// → { source: "venue", venue: "tim hortons", category: "cafe", min: 5, max: 12, avg: 9 }

// estimateCost("shake shack", "casual dining")
// → { source: "venue", venue: "shake shack", category: "casual dining", min: 12, max: 18, avg: 15 }

// estimateCost(null, "pizza")
// → { source: "category", venue: null, category: "pizza", min: 10, max: 20, avg: 15 }

// estimateCost(null, "unknown")
// → { source: "category", venue: null, category: "unknown", min: 15, max: 25, avg: 20 }