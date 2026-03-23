/**
 * app.js — Main Controller
 * Hackonomics Project
 *
 * Wires all modules together and handles
 * user interaction from the browser UI.
 */

// ─── Imports ──────────────────────────────────────────────────────────────────

import { calculateBudget } from "./budget.js";
import { analyzeInvitation } from "./analyzer.js";
import { estimateCost } from "./venuecosts.js";
import { calculateRisk } from "./risk.js";
import { getRecommendation } from "./recommendations.js";

// ─── DOM References ───────────────────────────────────────────────────────────

const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");

// ─── Helper: Validate Inputs ──────────────────────────────────────────────────

/**
 * Checks that all required fields are filled in and valid.
 * Returns an error message string, or null if everything is okay.
 *
 * @param {number} income
 * @param {number} expenses
 * @param {number} savings
 * @param {string} inviteText
 * @returns {string|null}
 */
function validateInputs(income, expenses, savings, inviteText) {
    if (isNaN(income) || isNaN(expenses) || isNaN(savings)) {
        return "Please enter valid numbers for income, expenses, and savings.";
    }
    if (income <= 0) {
        return "Income must be greater than zero.";
    }
    if (expenses < 0 || savings < 0) {
        return "Expenses and savings cannot be negative.";
    }
    if (!inviteText || inviteText.trim().length === 0) {
        return "Please paste the hangout invitation text before analyzing.";
    }
    return null; // all good
}

// ─── Helper: Render Error ─────────────────────────────────────────────────────

/**
 * Displays a friendly error message in the result area.
 *
 * @param {string} message
 */
function showError(message) {
    resultDiv.innerHTML = `
    <div class="error">
      ⚠️ <strong>Oops!</strong> ${message}
    </div>
  `;
}

// ─── Helper: Render Results ───────────────────────────────────────────────────

/**
 * Renders the full analysis result into the result div.
 *
 * @param {object} budget
 * @param {object} analysis
 * @param {object} cost
 * @param {object} risk
 * @param {object} recommendation
 */
function showResults(budget, analysis, cost, risk, recommendation) {
    // Map risk level to an emoji indicator
    const riskEmoji = { low: "🟢", medium: "🟡", high: "🔴" };

    resultDiv.innerHTML = `
    <div class="result-card">

      <h2>📊 Budget Breakdown</h2>
      <ul>
        <li><strong>Disposable Income:</strong> $${budget.disposableIncome.toFixed(2)} / month</li>
        <li><strong>Monthly Fun Budget:</strong> $${budget.monthlyFunBudget.toFixed(2)}</li>
        <li><strong>Weekly Fun Budget:</strong>  $${budget.weeklyFunBudget.toFixed(2)}</li>
      </ul>

      <h2>🔍 Invitation Analysis</h2>
      <ul>
        <li><strong>Detected Venue:</strong>    ${analysis.venue ?? "Not detected"}</li>
        <li><strong>Detected Category:</strong> ${analysis.category}</li>
      </ul>

      <h2>💸 Cost Estimate</h2>
      <ul>
        <li><strong>Estimated Range:</strong> $${cost.minCost} – $${cost.maxCost}</li>
        <li><strong>Average Cost:</strong>    $${cost.averageCost}</li>
        <li><strong>Source:</strong>          ${cost.source}</li>
      </ul>

      <h2>⚠️ Risk Assessment</h2>
      <ul>
        <li><strong>Risk Level:</strong>      ${riskEmoji[risk.riskLevel]} ${risk.riskLevel.toUpperCase()}</li>
        <li><strong>Budget Used:</strong>     ${risk.percentageUsed}% of your weekly fun budget</li>
        <li><strong>Remaining After:</strong> $${risk.remainingBudget.toFixed(2)}</li>
        <li><strong>Note:</strong>            ${risk.explanation}</li>
      </ul>

      <h2>💡 Recommendation</h2>
      <p><strong>Summary:</strong> ${recommendation.summary}</p>
      <p><strong>Advice:</strong>  ${recommendation.advice}</p>
      <p><strong>Action:</strong>  ${recommendation.action}</p>

      <div class="polite-message">
        <h3>💬 Suggested Reply to Send Your Friend</h3>
        <p>"${recommendation.politeMessage}"</p>
      </div>

    </div>
  `;
}

// ─── Main: Analyze Button Click ───────────────────────────────────────────────

analyzeBtn.addEventListener("click", () => {
    // Step 1 — Read raw input values from the UI
    const income = Number(document.getElementById("income").value);
    const expenses = Number(document.getElementById("expenses").value);
    const savings = Number(document.getElementById("savings").value);
    const inviteText = document.getElementById("inviteText").value;

    // Step 2 — Validate before running any logic
    const validationError = validateInputs(income, expenses, savings, inviteText);
    if (validationError) {
        showError(validationError);
        return; // stop here, don't crash
    }

    // Step 3 — Run the full analysis pipeline
    try {
        // a. Calculate user's budget
        const budget = calculateBudget(income, expenses, savings);

        // b. Analyze the hangout invitation text
        const analysis = analyzeInvitation(inviteText);

        // c. Estimate the cost based on detected venue / category
        const cost = estimateCost(analysis.venue, analysis.category);

        // d. Calculate financial risk vs weekly fun budget
        const risk = calculateRisk(cost.averageCost, budget.weeklyFunBudget);

        // e. Get a human-friendly recommendation
        const recommendation = getRecommendation(risk.riskLevel, risk.percentageUsed);

        // Step 4 — Render everything to the UI
        showResults(budget, analysis, cost, risk, recommendation);

    } catch (error) {
        // Catch any unexpected errors from the logic modules
        showError(`Something went wrong: ${error.message}`);
    }
});