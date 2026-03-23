/**
 * budget.js — Core financial calculator
 * Hackonomics Project
 *
 * Calculates disposable income and discretionary budgets
 * based on user's monthly income, expenses, and savings target.
 */

/**
 * Validates that all inputs are non-negative numbers.
 * Throws an error if any value is invalid.
 *
 * @param {number} income - Monthly income
 * @param {number} expenses - Monthly essential expenses
 * @param {number} savings - Monthly savings target
 */
function validateInputs(income, expenses, savings) {
    const fields = { income, expenses, savings };

    for (const [name, value] of Object.entries(fields)) {
        if (typeof value !== "number" || isNaN(value)) {
            throw new Error(`Invalid input: "${name}" must be a number.`);
        }
        if (value < 0) {
            throw new Error(`Invalid input: "${name}" cannot be negative.`);
        }
    }

    // Make sure expenses + savings don't exceed income
    if (expenses + savings > income) {
        throw new Error(
            `Expenses ($${expenses}) + savings target ($${savings}) exceed income ($${income}). Please review your numbers.`
        );
    }
}

/**
 * Calculates the user's budget breakdown.
 *
 * @param {number} income   - Total monthly income (e.g. 3000)
 * @param {number} expenses - Essential monthly expenses: rent, food, bills (e.g. 2000)
 * @param {number} savings  - Monthly savings target (e.g. 300)
 * @returns {{
 *   disposableIncome: number,
 *   monthlyFunBudget: number,
 *   weeklyFunBudget: number
 * }}
 */
function calculateBudget(income, expenses, savings) {
    // Step 1 — Validate all inputs before doing any math
    validateInputs(income, expenses, savings);

    // Step 2 — Disposable income = what's left after covering essentials + savings
    const disposableIncome = income - expenses - savings;

    // Step 3 — Monthly fun budget = same as disposable income
    // (all remaining money is available for discretionary spending)
    const monthlyFunBudget = disposableIncome;

    // Step 4 — Weekly fun budget = divide monthly by 4.33 (avg weeks per month)
    const weeklyFunBudget = parseFloat((monthlyFunBudget / 4.33).toFixed(2));

    return {
        disposableIncome,
        monthlyFunBudget,
        weeklyFunBudget,
    };
}

// ─── Quick test (remove or comment out before production) ───────────────────

const result = calculateBudget(3000, 2000, 300);
console.log("Budget breakdown:", result);
// Expected output:
// {
//   disposableIncome: 700,
//   monthlyFunBudget: 700,
//   weeklyFunBudget: ~161.66
// }

// ─── Export for use in app.js ────────────────────────────────────────────────

// If using ES Modules (recommended):
export { calculateBudget };

// If using CommonJS (Node.js without "type": "module"):
// module.exports = { calculateBudget };
