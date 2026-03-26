/**
 * venuecosts.js — Venue & Category Cost Estimator (v2)
 * Boundly / Hackonomics Project
 *
 * Prices are per person in USD (2025).
 * Sources: FOX/LiveNOW fast food data, US News, CableTV.com,
 *          Ridester/NerdWallet rideshare data, industry averages.
 */

// ─── Venue Cost Map ───────────────────────────────────────────────────────────

const VENUE_COSTS = {

    // ── Burgers ────────────────────────────────────────────────────────────
    "in-n-out": { min: 8, max: 14, category: "fast food" },
    "mcdonalds": { min: 9, max: 14, category: "fast food" },
    "mcdonald": { min: 9, max: 14, category: "fast food" },
    "mcd": { min: 9, max: 14, category: "fast food" },
    "burger king": { min: 9, max: 14, category: "fast food" },
    "wendy's": { min: 9, max: 14, category: "fast food" },
    "wendys": { min: 9, max: 14, category: "fast food" },
    "five guys": { min: 15, max: 20, category: "fast food" },
    "shake shack": { min: 12, max: 18, category: "fast food" },
    "whataburger": { min: 10, max: 15, category: "fast food" },
    "smashburger": { min: 11, max: 16, category: "fast food" },
    "habit burger": { min: 10, max: 15, category: "fast food" },
    "the habit": { min: 10, max: 15, category: "fast food" },

    // ── Chicken ────────────────────────────────────────────────────────────
    "kfc": { min: 9, max: 14, category: "fast food" },
    "chick-fil-a": { min: 9, max: 13, category: "fast food" },
    "chick fil a": { min: 9, max: 13, category: "fast food" },
    "popeyes": { min: 9, max: 14, category: "fast food" },
    "popeye's": { min: 9, max: 14, category: "fast food" },
    "raising cane": { min: 10, max: 15, category: "fast food" },
    "cane's": { min: 10, max: 15, category: "fast food" },
    "wingstop": { min: 13, max: 20, category: "fast food" },
    "dave's hot chicken": { min: 13, max: 20, category: "fast food" },
    "dave's": { min: 13, max: 20, category: "fast food" },
    "jollibee": { min: 10, max: 16, category: "fast food" },
    "culver's": { min: 10, max: 15, category: "fast food" },
    "culvers": { min: 10, max: 15, category: "fast food" },
    "dirty birds": { min: 13, max: 20, category: "fast food" },

    // ── Mexican / Other Fast Food ──────────────────────────────────────────
    "taco bell": { min: 8, max: 13, category: "fast food" },
    "chipotle": { min: 10, max: 16, category: "fast food" },
    "qdoba": { min: 10, max: 15, category: "fast food" },
    "del taco": { min: 8, max: 13, category: "fast food" },
    "panda express": { min: 10, max: 15, category: "fast food" },
    "arby's": { min: 9, max: 14, category: "fast food" },
    "arbys": { min: 9, max: 14, category: "fast food" },
    "sonic": { min: 8, max: 13, category: "fast food" },
    "jack in the box": { min: 8, max: 13, category: "fast food" },
    "jack in box": { min: 8, max: 13, category: "fast food" },

    // ── Subs & Sandwiches ─────────────────────────────────────────────────
    "subway": { min: 8, max: 13, category: "fast food" },
    "jersey mike": { min: 11, max: 16, category: "fast food" },
    "jersey mike's": { min: 11, max: 16, category: "fast food" },
    "jimmy john": { min: 9, max: 13, category: "fast food" },
    "jimmy john's": { min: 9, max: 13, category: "fast food" },
    "firehouse subs": { min: 10, max: 15, category: "fast food" },

    // ── Pizza ─────────────────────────────────────────────────────────────
    "papa johns": { min: 12, max: 20, category: "pizza" },
    "papa john": { min: 12, max: 20, category: "pizza" },
    "dominos": { min: 10, max: 18, category: "pizza" },
    "domino's": { min: 10, max: 18, category: "pizza" },
    "pizza hut": { min: 10, max: 18, category: "pizza" },
    "little caesars": { min: 6, max: 12, category: "pizza" },
    "little caesar": { min: 6, max: 12, category: "pizza" },

    // ── Casual Dining ─────────────────────────────────────────────────────
    "cheesecake factory": { min: 28, max: 45, category: "casual dining" },
    "applebee's": { min: 15, max: 25, category: "casual dining" },
    "applebees": { min: 15, max: 25, category: "casual dining" },
    "chili's": { min: 15, max: 25, category: "casual dining" },
    "chilis": { min: 15, max: 25, category: "casual dining" },
    "olive garden": { min: 18, max: 30, category: "casual dining" },
    "red lobster": { min: 22, max: 40, category: "casual dining" },
    "outback": { min: 20, max: 35, category: "casual dining" },
    "texas roadhouse": { min: 18, max: 32, category: "casual dining" },
    "red robin": { min: 15, max: 25, category: "casual dining" },
    "ihop": { min: 12, max: 22, category: "casual dining" },
    "denny's": { min: 10, max: 18, category: "casual dining" },
    "dennys": { min: 10, max: 18, category: "casual dining" },
    "cracker barrel": { min: 12, max: 20, category: "casual dining" },
    "buffalo wild wings": { min: 18, max: 30, category: "casual dining" },
    "bdubs": { min: 18, max: 30, category: "casual dining" },
    "bww": { min: 18, max: 30, category: "casual dining" },
    "hooters": { min: 18, max: 28, category: "casual dining" },
    "waffle house": { min: 8, max: 15, category: "casual dining" },
    "first watch": { min: 14, max: 22, category: "casual dining" },
    "big way": { min: 15, max: 25, category: "casual dining" },
    "toroast": { min: 18, max: 30, category: "casual dining" },
    "curry up now": { min: 14, max: 22, category: "casual dining" },
    "lemongrass": { min: 15, max: 25, category: "casual dining" },
    "babi panggang": { min: 15, max: 28, category: "casual dining" },
    "nasi padang": { min: 12, max: 22, category: "casual dining" },

    // ── Sushi / Japanese ─────────────────────────────────────────────────
    "kibo sushi": { min: 20, max: 35, category: "sushi" },
    "kibo": { min: 20, max: 35, category: "sushi" },
    "nobu": { min: 60, max: 120, category: "sushi" },
    "sugarfish": { min: 40, max: 70, category: "sushi" },

    // ── Cafe & Coffee ─────────────────────────────────────────────────────
    "starbucks": { min: 6, max: 12, category: "cafe" },
    "dunkin": { min: 4, max: 9, category: "cafe" },
    "dunkin donuts": { min: 4, max: 9, category: "cafe" },
    "dutch bros": { min: 5, max: 9, category: "cafe" },
    "dutch brother": { min: 5, max: 9, category: "cafe" },
    "tim hortons": { min: 5, max: 12, category: "cafe" },
    "tim horton": { min: 5, max: 12, category: "cafe" },
    "peet's": { min: 6, max: 11, category: "cafe" },
    "peets": { min: 6, max: 11, category: "cafe" },
    "blue bottle": { min: 7, max: 12, category: "cafe" },
    "cha bar": { min: 8, max: 16, category: "cafe" },
    "panera": { min: 10, max: 16, category: "cafe" },
    "panera bread": { min: 10, max: 16, category: "cafe" },

    // ── Boba & Drinks ─────────────────────────────────────────────────────
    "boba": { min: 6, max: 10, category: "drinks" },
    "bubble tea": { min: 6, max: 10, category: "drinks" },
    "gong cha": { min: 6, max: 10, category: "drinks" },
    "tiger sugar": { min: 7, max: 11, category: "drinks" },
    "kung fu tea": { min: 6, max: 10, category: "drinks" },

    // ── Smoothies ─────────────────────────────────────────────────────────
    "jamba": { min: 7, max: 12, category: "smoothies" },
    "jamba juice": { min: 7, max: 12, category: "smoothies" },
    "tropical smoothie": { min: 7, max: 11, category: "smoothies" },
    "smoothie king": { min: 7, max: 11, category: "smoothies" },

    // ── Movies ────────────────────────────────────────────────────────────
    "amc": { min: 14, max: 22, category: "movie" },
    "regal": { min: 13, max: 20, category: "movie" },
    "cinemark": { min: 11, max: 18, category: "movie" },
    "imax": { min: 20, max: 30, category: "movie" },
    "alamo drafthouse": { min: 15, max: 25, category: "movie" },
    "alamo": { min: 15, max: 25, category: "movie" },

    // ── Bowling ───────────────────────────────────────────────────────────
    "bowling": { min: 15, max: 30, category: "bowling" },
    "bowlero": { min: 18, max: 35, category: "bowling" },
    "lucky strike": { min: 20, max: 40, category: "bowling" },
    "brunswick zone": { min: 15, max: 28, category: "bowling" },

    // ── Arcade & Activities ───────────────────────────────────────────────
    "dave and buster": { min: 25, max: 50, category: "arcade" },
    "dave & buster": { min: 25, max: 50, category: "arcade" },
    "main event": { min: 20, max: 40, category: "arcade" },
    "topgolf": { min: 30, max: 60, category: "mini golf" },
    "mini golf": { min: 10, max: 18, category: "mini golf" },
    "escape room": { min: 28, max: 45, category: "escape room" },
    "the escape game": { min: 28, max: 40, category: "escape room" },
    "sky zone": { min: 20, max: 35, category: "trampoline park" },
    "urban air": { min: 20, max: 35, category: "trampoline park" },
    "laser tag": { min: 10, max: 20, category: "laser tag" },
    "axe throwing": { min: 25, max: 40, category: "axe throwing" },
    "bad axe": { min: 25, max: 40, category: "axe throwing" },
    "karaoke": { min: 15, max: 35, category: "nightlife" },

    // ── Transport ─────────────────────────────────────────────────────────
    "uber": { min: 12, max: 30, category: "rideshare" },
    "lyft": { min: 12, max: 28, category: "rideshare" },
    "taxi": { min: 15, max: 35, category: "rideshare" },
    "metro": { min: 2, max: 5, category: "public transit" },
    "bus": { min: 2, max: 4, category: "public transit" },
    "bart": { min: 3, max: 8, category: "public transit" },
    "mta": { min: 3, max: 6, category: "public transit" },

    // ── Subscriptions ─────────────────────────────────────────────────────
    "netflix": { min: 7, max: 23, category: "subscription" },
    "hulu": { min: 8, max: 18, category: "subscription" },
    "disney plus": { min: 8, max: 14, category: "subscription" },
    "disney+": { min: 8, max: 14, category: "subscription" },
    "hbo max": { min: 10, max: 20, category: "subscription" },
    "spotify": { min: 6, max: 12, category: "subscription" },
    "apple music": { min: 6, max: 11, category: "subscription" },
    "amazon prime": { min: 9, max: 15, category: "subscription" },
};

// ─── Category Fallback Map ────────────────────────────────────────────────────

const CATEGORY_COSTS = {
    "fast food": { min: 9, max: 16 },
    "pizza": { min: 10, max: 20 },
    "casual dining": { min: 18, max: 35 },
    "sushi": { min: 20, max: 50 },
    "brunch": { min: 16, max: 30 },
    "dining": { min: 18, max: 35 },
    "cafe": { min: 5, max: 12 },
    "drinks": { min: 6, max: 12 },
    "smoothies": { min: 7, max: 12 },
    "movie": { min: 13, max: 22 },
    "bowling": { min: 15, max: 35 },
    "mini golf": { min: 10, max: 25 },
    "arcade": { min: 20, max: 50 },
    "escape room": { min: 28, max: 45 },
    "trampoline park": { min: 18, max: 35 },
    "laser tag": { min: 10, max: 22 },
    "axe throwing": { min: 25, max: 45 },
    "concert": { min: 40, max: 150 },
    "comedy show": { min: 20, max: 50 },
    "nightlife": { min: 20, max: 60 },
    "rideshare": { min: 10, max: 30 },
    "public transit": { min: 2, max: 6 },
    "shopping": { min: 20, max: 80 },
    "subscription": { min: 6, max: 20 },
    "outdoor": { min: 0, max: 20 },
    "gym": { min: 10, max: 30 },
    "unknown": { min: 15, max: 30 },
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Estimates the cost of a social outing.
 *
 * @param {string|null} venue
 * @param {string}      category
 * @returns {{ source, venue, category, minCost, maxCost, averageCost }}
 */
function estimateCost(venue, category) {
    const normalizedVenue = venue ? venue.toLowerCase().trim() : null;
    const normalizedCategory = category ? category.toLowerCase().trim() : "unknown";

    if (normalizedVenue && VENUE_COSTS[normalizedVenue]) {
        const data = VENUE_COSTS[normalizedVenue];
        return buildResult("venue", normalizedVenue, data.category, data.min, data.max);
    }

    if (CATEGORY_COSTS[normalizedCategory]) {
        const data = CATEGORY_COSTS[normalizedCategory];
        return buildResult("category", normalizedVenue, normalizedCategory, data.min, data.max);
    }

    const fallback = CATEGORY_COSTS["unknown"];
    return buildResult("default", normalizedVenue, "unknown", fallback.min, fallback.max);
}

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
// module.exports = { estimateCost };

// ─── Test Cases ───────────────────────────────────────────────────────────────
// estimateCost("chick-fil-a", "fast food") → { min: 9, max: 13, avg: 11 }
// estimateCost("imax", "movie")            → { min: 20, max: 30, avg: 25 }
// estimateCost("uber", "rideshare")        → { min: 12, max: 30, avg: 21 }
// estimateCost("sky zone", "trampoline")   → { min: 20, max: 35, avg: 28 }
// estimateCost("netflix", "subscription")  → { min: 7, max: 23, avg: 15 }
// estimateCost(null, "concert")            → { min: 40, max: 150, avg: 95 }