/**
 * venuecosts.js — Venue & Category Cost Estimator
 * Hackonomics Project
 *
 * Estimates the cost of a social outing based on
 * a detected venue name or spending category.
 */

// ─── Venue Cost Map ───────────────────────────────────────────────────────────
// Known venues with their estimated cost range (per person, in USD).
// Add more venues here as the project grows.

const VENUE_COSTS = {
    "in-n-out": { min: 12, max: 18, category: "fast food" },
    "cheesecake factory": { min: 28, max: 40, category: "casual dining" },
    "starbucks": { min: 6, max: 10, category: "cafe" },
    "boba": { min: 7, max: 12, category: "drinks" },
    "mcdonalds": { min: 10, max: 15, category: "fast food" },
};

// ─── Category Fallback Map ────────────────────────────────────────────────────
// Used when no matching venue is found.
// Provides a general cost range per spending category.

const CATEGORY_COSTS = {
    "fast food": { min: 10, max: 18 },
    "cafe": { min: 6, max: 12 },
    "drinks": { min: 7, max: 12 },
    "casual dining": { min: 20, max: 35 },
    "dining": { min: 18, max: 35 },
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
 *
 * @param {string}      source
 * @param {string|null} venue
 * @param {string}      category
 * @param {number}      min
 * @param {number}      max
 * @returns {object}
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

// estimateCost("in-n-out", "fast food")
// → { source: "venue", venue: "in-n-out", category: "fast food",
//     minCost: 12, maxCost: 18, averageCost: 15 }

// estimateCost(null, "cafe")
// → { source: "category", venue: null, category: "cafe",
//     minCost: 6, maxCost: 12, averageCost: 9 }

// estimateCost("unknown place", "dining")
// → { source: "category", venue: "unknown place", category: "dining",
//     minCost: 18, maxCost: 35, averageCost: 27 }

// estimateCost(null, "unknown")
// → { source: "category", venue: null, category: "unknown",
//     minCost: 15, maxCost: 25, averageCost: 20 }
