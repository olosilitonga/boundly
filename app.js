/**
 * app.js — Main Controller (v2)
 * Boundly / Hackonomics Project
 *
 * Improvements:
 * - Color-coded risk badge
 * - Progress bar showing % of weekly budget used
 * - Copy button on polite message
 * - Save each analysis to localStorage
 * - FOMO score tracking (declined hangouts counter)
 */

import { calculateBudget } from "./budget.js";
import { analyzeInvitation } from "./analyzer.js";
import { estimateCost } from "./venuecosts.js";
import { calculateRisk } from "./risk.js";
import { getRecommendation } from "./recommendations.js";

// ─── DOM References ───────────────────────────────────────────────────────────

const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");

// ─── LocalStorage Helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "boundly_history";
const FOMO_KEY = "boundly_fomo";

/**
 * Loads full history array from localStorage.
 * @returns {Array}
 */
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Saves a new analysis entry to localStorage history.
 * @param {object} entry
 */
function saveToHistory(entry) {
  const history = loadHistory();
  history.unshift(entry); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * Increments the FOMO score when user declines (high risk).
 */
function incrementFomo() {
  const current = parseInt(localStorage.getItem(FOMO_KEY) || "0");
  localStorage.setItem(FOMO_KEY, current + 1);
}

/**
 * Gets current FOMO score.
 * @returns {number}
 */
function getFomoScore() {
  return parseInt(localStorage.getItem(FOMO_KEY) || "0");
}

// ─── Input Validation ─────────────────────────────────────────────────────────

function validateInputs(income, expenses, savings, inviteText) {
  if (isNaN(income) || isNaN(expenses) || isNaN(savings)) {
    return "Please enter valid numbers for income, expenses, and savings.";
  }
  if (income <= 0) return "Income must be greater than zero.";
  if (expenses < 0 || savings < 0) return "Expenses and savings cannot be negative.";
  if (!inviteText || inviteText.trim().length === 0) {
    return "Please paste the hangout invitation text before analyzing.";
  }
  return null;
}

// ─── Error Display ────────────────────────────────────────────────────────────

function showError(message) {
  resultDiv.innerHTML = `
    <div class="error">⚠️ <strong>Oops!</strong> ${message}</div>
  `;
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────

/**
 * Returns a color-coded badge HTML string based on risk level.
 * @param {"low"|"medium"|"high"} riskLevel
 * @returns {string}
 */
function riskBadge(riskLevel) {
  const config = {
    low: { emoji: "🟢", label: "LOW RISK", cls: "badge-low" },
    medium: { emoji: "🟡", label: "MEDIUM RISK", cls: "badge-medium" },
    high: { emoji: "🔴", label: "HIGH RISK", cls: "badge-high" },
  };
  const { emoji, label, cls } = config[riskLevel];
  return `<span class="risk-badge ${cls}">${emoji} ${label}</span>`;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

/**
 * Returns a progress bar HTML string.
 * @param {number} percentage
 * @param {"low"|"medium"|"high"} riskLevel
 * @returns {string}
 */
function progressBar(percentage, riskLevel) {
  const capped = Math.min(percentage, 100);
  return `
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Weekly budget used</span>
        <span><strong>${percentage}%</strong></span>
      </div>
      <div class="progress-track">
        <div class="progress-fill progress-${riskLevel}" style="width: ${capped}%"></div>
      </div>
    </div>
  `;
}

// ─── Render Results ───────────────────────────────────────────────────────────

function showResults(budget, analysis, cost, risk, recommendation, fomoScore) {
  resultDiv.innerHTML = `
    <div class="result-card">

      <div class="result-header">
        <h2>📊 Analysis Result</h2>
        ${riskBadge(risk.riskLevel)}
      </div>

      ${progressBar(risk.percentageUsed, risk.riskLevel)}

      <div class="result-section">
        <h3>💼 Your Budget</h3>
        <ul>
          <li><span>Disposable Income</span> <strong>$${budget.disposableIncome.toFixed(2)}/mo</strong></li>
          <li><span>Monthly Fun Budget</span> <strong>$${budget.monthlyFunBudget.toFixed(2)}</strong></li>
          <li><span>Weekly Fun Budget</span>  <strong>$${budget.weeklyFunBudget.toFixed(2)}</strong></li>
        </ul>
      </div>

      <div class="result-section">
        <h3>🔍 Invitation Detected</h3>
        <ul>
          <li><span>Venue</span>    <strong>${analysis.venue ?? "Not detected"}</strong></li>
          <li><span>Category</span> <strong>${analysis.category}</strong></li>
          <li><span>Est. Cost</span><strong>$${cost.minCost}–$${cost.maxCost} <em>(avg $${cost.averageCost})</em></strong></li>
          <li><span>Remaining After</span><strong>$${risk.remainingBudget.toFixed(2)}</strong></li>
        </ul>
      </div>

      <div class="result-section">
        <h3>💡 Recommendation</h3>
        <p class="advice-text">${recommendation.summary}</p>
        <p class="advice-text">${recommendation.advice}</p>
        <p class="advice-text muted">${recommendation.action}</p>
      </div>

      <div class="polite-message">
        <div class="polite-header">
          <h3>💬 Suggested Reply</h3>
          <button class="copy-btn" onclick="copyReply(this)">Copy</button>
        </div>
        <p id="polite-text">"${recommendation.politeMessage}"</p>
      </div>

      <div class="fomo-tracker">
        <span>🙈 FOMO Score</span>
        <strong>${fomoScore} hang${fomoScore === 1 ? "out" : "outs"} skipped to protect your budget</strong>
      </div>

    </div>
  `;
}

// ─── Copy Reply Handler ───────────────────────────────────────────────────────

window.copyReply = function (btn) {
  const text = document.getElementById("polite-text")?.innerText || "";
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 2000);
  });
};

// ─── Main: Analyze Button ─────────────────────────────────────────────────────

analyzeBtn.addEventListener("click", () => {
  // Step 1 — Read inputs
  const income = Number(document.getElementById("income").value);
  const expenses = Number(document.getElementById("expenses").value);
  const savings = Number(document.getElementById("savings").value);
  const inviteText = document.getElementById("inviteText").value;

  // Step 2 — Validate
  const error = validateInputs(income, expenses, savings, inviteText);
  if (error) { showError(error); return; }

  try {
    // Step 3 — Run pipeline
    const budget = calculateBudget(income, expenses, savings);
    const analysis = analyzeInvitation(inviteText);
    const cost = estimateCost(analysis.venue, analysis.category);
    const risk = calculateRisk(cost.averageCost, budget.weeklyFunBudget);
    const recommendation = getRecommendation(risk.riskLevel, risk.percentageUsed);

    // Step 4 — Update FOMO score if high risk
    if (risk.riskLevel === "high") incrementFomo();
    const fomoScore = getFomoScore();

    // Step 5 — Save to localStorage history
    saveToHistory({
      date: new Date().toISOString(),
      inviteText: inviteText.trim(),
      venue: analysis.venue,
      category: analysis.category,
      averageCost: cost.averageCost,
      riskLevel: risk.riskLevel,
      percentageUsed: risk.percentageUsed,
      weeklyBudget: budget.weeklyFunBudget,
      politeMessage: recommendation.politeMessage,
    });

    // Step 6 — Render
    showResults(budget, analysis, cost, risk, recommendation, fomoScore);

  } catch (err) {
    showError(`Something went wrong: ${err.message}`);
  }
});