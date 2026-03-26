/**
 * analyzer.js — Hangout Invitation Analyzer (v2)
 * Boundly / Hackonomics Project
 *
 * Detects venue + category from a hangout invitation text.
 * Covers: fast food, casual dining, cafes, drinks, entertainment,
 *         transport, subscriptions, nightlife, and more.
 */

// ─── Venue → Category Map ─────────────────────────────────────────────────────

const VENUE_MAP = {

    // ── Fast Food (Burgers) ─────────────────────────────────────────────────
    "in-n-out": "fast food",
    "mcdonalds": "fast food",
    "mcdonald": "fast food",
    "mcd": "fast food",
    "burger king": "fast food",
    "wendy's": "fast food",
    "wendys": "fast food",
    "five guys": "fast food",
    "shake shack": "fast food",
    "whataburger": "fast food",
    "smashburger": "fast food",
    "habit burger": "fast food",
    "the habit": "fast food",

    // ── Fast Food (Chicken) ─────────────────────────────────────────────────
    "kfc": "fast food",
    "chick-fil-a": "fast food",
    "chick fil a": "fast food",
    "popeyes": "fast food",
    "popeye's": "fast food",
    "raising cane": "fast food",
    "cane's": "fast food",
    "wingstop": "fast food",
    "dave's hot chicken": "fast food",
    "dave's": "fast food",
    "jollibee": "fast food",
    "culver's": "fast food",
    "culvers": "fast food",

    // ── Fast Food (Mexican / Other) ─────────────────────────────────────────
    "taco bell": "fast food",
    "chipotle": "fast food",
    "qdoba": "fast food",
    "del taco": "fast food",
    "panda express": "fast food",
    "arby's": "fast food",
    "arbys": "fast food",
    "sonic": "fast food",
    "jack in the box": "fast food",
    "jack in box": "fast food",

    // ── Fast Food (Subs / Sandwiches) ───────────────────────────────────────
    "subway": "fast food",
    "jersey mike": "fast food",
    "jersey mike's": "fast food",
    "jimmy john": "fast food",
    "jimmy john's": "fast food",
    "firehouse subs": "fast food",

    // ── Fast Food (Pizza) ───────────────────────────────────────────────────
    "papa johns": "pizza",
    "papa john": "pizza",
    "dominos": "pizza",
    "domino's": "pizza",
    "pizza hut": "pizza",
    "little caesars": "pizza",
    "little caesar": "pizza",

    // ── Casual Dining ───────────────────────────────────────────────────────
    "cheesecake factory": "casual dining",
    "applebee's": "casual dining",
    "applebees": "casual dining",
    "chili's": "casual dining",
    "chilis": "casual dining",
    "olive garden": "casual dining",
    "red lobster": "casual dining",
    "outback": "casual dining",
    "texas roadhouse": "casual dining",
    "red robin": "casual dining",
    "ihop": "casual dining",
    "denny's": "casual dining",
    "dennys": "casual dining",
    "cracker barrel": "casual dining",
    "buffalo wild wings": "casual dining",
    "bdubs": "casual dining",
    "bww": "casual dining",
    "hooters": "casual dining",
    "waffle house": "casual dining",
    "first watch": "casual dining",
    "the melting pot": "casual dining",

    // ── Asian & International ────────────────────────────────────────────────
    "kibo sushi": "sushi",
    "nobu": "sushi",
    "sugarfish": "sushi",
    "sushi": "sushi",
    "ramen": "casual dining",
    "pho": "casual dining",
    "curry up now": "casual dining",
    "lemongrass": "casual dining",
    "babi panggang": "casual dining",
    "nasi padang": "casual dining",
    "big way": "casual dining",
    "toroast": "casual dining",

    // ── Cafe & Coffee ───────────────────────────────────────────────────────
    "starbucks": "cafe",
    "dunkin": "cafe",
    "dunkin donuts": "cafe",
    "dutch bros": "cafe",
    "dutch brother": "cafe",
    "tim hortons": "cafe",
    "tim horton": "cafe",
    "peet's": "cafe",
    "peets": "cafe",
    "caribou coffee": "cafe",
    "scooter's coffee": "cafe",
    "philz": "cafe",
    "blue bottle": "cafe",
    "cha bar": "cafe",
    "panera": "cafe",
    "panera bread": "cafe",

    // ── Drinks & Boba ───────────────────────────────────────────────────────
    "boba": "drinks",
    "bubble tea": "drinks",
    "gong cha": "drinks",
    "tiger sugar": "drinks",
    "kung fu tea": "drinks",
    "koi": "drinks",
    "happy lemon": "drinks",
    "one zo": "drinks",
    "85c": "drinks",
    "85 degrees": "drinks",
    "sharetea": "drinks",
    "coco": "drinks",

    // ── Smoothies & Juice ───────────────────────────────────────────────────
    "jamba": "smoothies",
    "jamba juice": "smoothies",
    "tropical smoothie": "smoothies",
    "smoothie king": "smoothies",
    "pressed juicery": "smoothies",

    // ── Entertainment (Movies) ──────────────────────────────────────────────
    "amc": "movie",
    "regal": "movie",
    "cinemark": "movie",
    "imax": "movie",
    "alamo drafthouse": "movie",
    "alamo": "movie",
    "arclight": "movie",

    // ── Entertainment (Bowling) ─────────────────────────────────────────────
    "bowling": "bowling",
    "bowlero": "bowling",
    "lucky strike": "bowling",
    "brunswick zone": "bowling",

    // ── Entertainment (Mini Golf / Arcade / Activities) ─────────────────────
    "mini golf": "mini golf",
    "put put": "mini golf",
    "putt putt": "mini golf",
    "dave and buster": "arcade",
    "dave & buster": "arcade",
    "main event": "arcade",
    "topgolf": "mini golf",
    "escapology": "escape room",
    "escape room": "escape room",
    "the escape game": "escape room",
    "breakout games": "escape room",
    "trampoline": "trampoline park",
    "sky zone": "trampoline park",
    "urban air": "trampoline park",
    "altitude trampoline": "trampoline park",
    "laser tag": "laser tag",
    "axe throwing": "axe throwing",
    "bad axe": "axe throwing",
    "the range": "axe throwing",

    // ── Entertainment (Concerts / Events) ───────────────────────────────────
    "concert": "concert",
    "coachella": "concert",
    "comedy club": "comedy show",
    "improv": "comedy show",
    "comedy store": "comedy show",
    "the laugh factory": "comedy show",

    // ── Entertainment (Nightlife) ────────────────────────────────────────────
    "bar": "nightlife",
    "club": "nightlife",
    "rooftop bar": "nightlife",
    "speakeasy": "nightlife",
    "karaoke": "nightlife",
    "hookah": "nightlife",

    // ── Transport ────────────────────────────────────────────────────────────
    "uber": "rideshare",
    "lyft": "rideshare",
    "taxi": "rideshare",
    "cab": "rideshare",
    "metro": "public transit",
    "subway train": "public transit",
    "bus": "public transit",
    "train": "public transit",
    "bart": "public transit",
    "mta": "public transit",

    // ── Subscriptions ────────────────────────────────────────────────────────
    "netflix": "subscription",
    "hulu": "subscription",
    "disney plus": "subscription",
    "disney+": "subscription",
    "hbo max": "subscription",
    "max": "subscription",
    "spotify": "subscription",
    "apple music": "subscription",
    "youtube premium": "subscription",
    "amazon prime": "subscription",
    "twitch": "subscription",
    "crunchyroll": "subscription",
};

// ─── Keyword → Category Fallback ─────────────────────────────────────────────

const KEYWORD_MAP = {
    "fast food": ["burger", "fries", "nuggets", "chicken sandwich", "combo meal", "drive thru", "drive-thru", "value meal"],
    "casual dining": ["dinner", "restaurant", "eat out", "makan", "lunch", "brunch", "dine", "sit down"],
    "pizza": ["pizza", "pie", "pepperoni", "slice"],
    "sushi": ["sushi", "roll", "sashimi", "omakase", "nigiri"],
    "cafe": ["coffee", "cafe", "latte", "cappuccino", "espresso", "donut", "pastry", "croissant"],
    "drinks": ["boba", "milk tea", "bubble tea", "teh", "matcha latte"],
    "smoothies": ["smoothie", "juice", "acai", "blend"],
    "movie": ["movie", "film", "cinema", "bioskop", "nonton", "theater", "screening"],
    "bowling": ["bowling", "bowl", "lanes", "strikes"],
    "arcade": ["arcade", "games", "dave buster", "laser tag"],
    "mini golf": ["mini golf", "putt", "golfing"],
    "escape room": ["escape room", "escape game", "locked room"],
    "trampoline park": ["trampoline", "jump", "sky zone"],
    "concert": ["concert", "show", "gig", "festival", "live music", "tour"],
    "comedy show": ["comedy", "stand up", "standup", "laugh"],
    "nightlife": ["bar", "club", "clubbing", "drinks out", "rooftop", "hookah", "karaoke", "pub"],
    "rideshare": ["uber", "lyft", "rideshare", "ride share", "grab a ride", "taxi"],
    "public transit": ["metro", "bus", "train", "transit", "subway", "bart"],
    "shopping": ["mall", "shopping", "outlet", "thrift", "target", "walmart", "ross"],
    "subscription": ["netflix", "hulu", "spotify", "stream", "subscribe", "disney"],
    "brunch": ["brunch", "pancakes", "waffles", "mimosa", "eggs benny"],
    "outdoor": ["hiking", "beach", "park", "picnic", "camping", "trail"],
    "gym": ["gym", "workout", "fitness", "yoga", "pilates", "spin class"],
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Analyzes a hangout invitation text.
 *
 * @param {string} text - The raw invitation message
 * @returns {{ venue: string|null, category: string }}
 */
function analyzeInvitation(text) {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
        throw new Error("analyzeInvitation: text must be a non-empty string.");
    }

    const normalized = text.toLowerCase();

    // Step 1 — Try venue match first (most specific)
    for (const [venue, category] of Object.entries(VENUE_MAP)) {
        if (normalized.includes(venue)) {
            return { venue, category };
        }
    }

    // Step 2 — Fall back to keyword-based category
    for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
        for (const keyword of keywords) {
            if (normalized.includes(keyword)) {
                return { venue: null, category };
            }
        }
    }

    // Step 3 — No match
    return { venue: null, category: "unknown" };
}

// ─── Export ───────────────────────────────────────────────────────────────────

export { analyzeInvitation };
// module.exports = { analyzeInvitation };

// ─── Test Cases ───────────────────────────────────────────────────────────────
// analyzeInvitation("Chick-fil-A run?")         → { venue: "chick-fil-a", category: "fast food" }
// analyzeInvitation("Wanna catch a movie?")     → { venue: null, category: "movie" }
// analyzeInvitation("Bowling tonight at 9?")    → { venue: "bowling", category: "bowling" }
// analyzeInvitation("Uber to the concert!")     → { venue: "uber", category: "rideshare" }
// analyzeInvitation("Netflix and chill?")       → { venue: "netflix", category: "subscription" }
// analyzeInvitation("Sky Zone this Saturday?")  → { venue: "sky zone", category: "trampoline park" }