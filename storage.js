/**
 * storage.js — User Profile Storage
 * Boundly / Hackonomics Project
 *
 * Saves, loads, and clears the user's financial profile
 * using localStorage so it persists between sessions.
 */

// ─── Storage Key ──────────────────────────────────────────────────────────────

const PROFILE_KEY = "boundlyUserProfile";

// ─── Save ─────────────────────────────────────────────────────────────────────

/**
 * Saves the user's financial profile to localStorage.
 *
 * @param {{ income: number, expenses: number, savings: number }} profile
 */
function saveUserProfile(profile) {
    try {
        const json = JSON.stringify(profile);
        localStorage.setItem(PROFILE_KEY, json);
    } catch (error) {
        console.error("Boundly: failed to save profile.", error);
    }
}

// ─── Load ─────────────────────────────────────────────────────────────────────

/**
 * Loads the user's financial profile from localStorage.
 *
 * @returns {{ income: number, expenses: number, savings: number } | null}
 */
function loadUserProfile() {
    try {
        const json = localStorage.getItem(PROFILE_KEY);

        // Return null if nothing has been saved yet
        if (!json) return null;

        return JSON.parse(json);
    } catch (error) {
        console.error("Boundly: failed to load profile.", error);
        return null;
    }
}

// ─── Clear ────────────────────────────────────────────────────────────────────

/**
 * Removes the user's financial profile from localStorage.
 */
function clearUserProfile() {
    try {
        localStorage.removeItem(PROFILE_KEY);
    } catch (error) {
        console.error("Boundly: failed to clear profile.", error);
    }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export { saveUserProfile, loadUserProfile, clearUserProfile };

// CommonJS alternative:
// module.exports = { saveUserProfile, loadUserProfile, clearUserProfile };

// ─── Test Cases ───────────────────────────────────────────────────────────────

// saveUserProfile({ income: 3000, expenses: 2000, savings: 300 })
// → saves to localStorage under "boundlyUserProfile"

// loadUserProfile()
// → { income: 3000, expenses: 2000, savings: 300 }

// loadUserProfile() with nothing saved
// → null

// clearUserProfile()
// → removes "boundlyUserProfile" from localStorage
