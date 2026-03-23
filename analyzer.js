/**
 * analyzer.js — Hangout Invitation Analyzer
 * Hackonomics Project
 *
 * Analyzes a hangout invitation text and returns
 * a structured object with detected venue and category.
 */

// ─── Venue → Category Mapping ─────────────────────────────────────────────────
// Known venues and their associated spending category.
// Add more venues here as needed.

const VENUE_MAP = {
    "in-n-out": "fast food",
    "cheesecake factory": "casual dining",
    "starbucks": "cafe",
    "boba": "drinks",
    "mcdonalds": "fast food",
};

// ─── Keyword → Category Fallback ─────────────────────────────────────────────
// Used when no known venue is detected.
// Each category maps to a list of trigger keywords.

const KEYWORD_MAP = {
    "fast food": ["burger", "fries"],
    "cafe": ["coffee", "cafe"],
    "drinks": ["boba", "milk tea"],
    "dining": ["dinner", "restaurant", "eat"],
    "entertainment": ["movie", "cinema"],
    "brunch": ["brunch"],
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Analyzes a hangout invitation text.
 *
 * @param {string} text - The raw invitation message
 * @returns {{ venue: string|null, category: string }}
 */
function analyzeInvitation(text) {
    // Step 1 — Normalize: lowercase for case-insensitive matching
    const normalized = text.toLowerCase();

    // Step 2 — Try to detect a known venue first
    for (const [venue, category] of Object.entries(VENUE_MAP)) {
        if (normalized.includes(venue)) {
            return { venue, category };
        }
    }

    // Step 3 — No venue found, fall back to keyword-based category detection
    for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
        for (const keyword of keywords) {
            if (normalized.includes(keyword)) {
                return { venue: null, category };
            }
        }
    }

    // Step 4 — Nothing matched, return unknown
    return { venue: null, category: "unknown" };
}

// ─── Export ───────────────────────────────────────────────────────────────────

export { analyzeInvitation };

// CommonJS alternative:
// module.exports = { analyzeInvitation };

// ─── Test Cases ───────────────────────────────────────────────────────────────

// analyzeInvitation("Let's eat at Cheesecake Factory tonight")
// → { venue: "cheesecake factory", category: "casual dining" }

// analyzeInvitation("Wanna grab boba after class?")
// → { venue: "boba", category: "drinks" }

// analyzeInvitation("Movie tonight?")
// → { venue: null, category: "entertainment" }

// analyzeInvitation("Let's get food")
// → { venue: null, category: "dining" }
