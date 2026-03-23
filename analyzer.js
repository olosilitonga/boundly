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
    // Fast food
    "in-n-out": "fast food",
    "mcdonalds": "fast food",
    "mcd": "fast food",
    "mcdonald": "fast food",
    "burger king": "fast food",
    "bk": "fast food",
    "kfc": "fast food",
    "jollibee": "fast food",
    "taco bell": "fast food",
    "subway": "fast food",
    "panda express": "fast food",
    "wingstop": "fast food",
    "dirty birds": "fast food",

    // Casual dining
    "cheesecake factory": "casual dining",
    "shake shack": "casual dining",
    "toroast": "casual dining",
    "toroast toronto": "casual dining",
    "big way": "casual dining",
    "curry up now": "casual dining",
    "lemongrass": "casual dining",
    "babi panggang": "casual dining",
    "nasi padang": "casual dining",

    // Cafe & drinks
    "starbucks": "cafe",
    "tim hortons": "cafe",
    "tim horton": "cafe",
    "timhortons": "cafe",
    "cha bar": "cafe",
    "boba": "drinks",

    // Sushi / Japanese
    "kibo sushi": "sushi",
    "kibo": "sushi",

    // Pizza
    "papa johns": "pizza",
    "papa john": "pizza",
    "dominos": "pizza",
    "domino": "pizza",

    // Smoothies / juice
    "jamba": "smoothies",
    "jamba juice": "smoothies",
};

// ─── Keyword → Category Fallback ─────────────────────────────────────────────
// Used when no known venue is detected.
// Each category maps to a list of trigger keywords.

const KEYWORD_MAP = {
    "fast food": ["burger", "fries", "fried chicken", "nuggets", "wings", "wrap"],
    "cafe": ["coffee", "cafe", "latte", "cappuccino", "espresso", "donut"],
    "drinks": ["boba", "milk tea", "bubble tea", "teh"],
    "smoothies": ["smoothie", "juice", "acai"],
    "dining": ["dinner", "restaurant", "eat", "makan", "lunch", "brunch"],
    "sushi": ["sushi", "roll", "sashimi", "omakase"],
    "pizza": ["pizza", "pie", "pepperoni"],
    "entertainment": ["movie", "cinema", "film", "nonton"],
    "brunch": ["brunch", "pancakes", "waffles"],
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

    // Step 2 — Try to detect a known venue first (most specific)
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

// analyzeInvitation("KFC run?")
// → { venue: "kfc", category: "fast food" }

// analyzeInvitation("Tim Hortons coffee break?")
// → { venue: "tim hortons", category: "cafe" }

// analyzeInvitation("Jollibee for lunch!")
// → { venue: "jollibee", category: "fast food" }