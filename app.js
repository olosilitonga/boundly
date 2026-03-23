/**
 * app.js — Main Controller (v4)
 * Boundly / Hackonomics Project
 *
 * New in v4:
 * - "I'm In" / "I'm Out" decision buttons after analysis
 * - "I'm In"  → saves to spending history, deducts from fun budget
 * - "I'm Out" → increments FOMO score, budget untouched
 */

import { calculateBudget } from "./budget.js";
import { analyzeInvitation } from "./analyzer.js";
import { estimateCost } from "./venuecosts.js";
import { calculateRisk } from "./risk.js";
import { getRecommendation } from "./recommendations.js";
import { getAISuggestion } from "./aiSuggestions.js";

// ─── API Key ──────────────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = "YOUR_OPENROUTER_API_KEY_HERE";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const HISTORY_KEY = "boundly_history";
const FOMO_KEY = "boundly_fomo";
const SPENDING_KEY = "boundly_spendings";

// ─── Storage Helpers ──────────────────────────────────────────────────────────

function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
function loadSpendings() { try { return JSON.parse(localStorage.getItem(SPENDING_KEY)) || []; } catch { return []; } }
function saveSpendings(arr) { localStorage.setItem(SPENDING_KEY, JSON.stringify(arr)); }
function getFomoScore() { return parseInt(localStorage.getItem(FOMO_KEY) || "0"); }
function incrementFomo() { localStorage.setItem(FOMO_KEY, getFomoScore() + 1); }

function saveToHistory(entry) {
  const history = loadHistory();
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Logs a confirmed "I'm In" spending to the spending history.
 * @param {{ label: string, amount: number, category: string }} item
 */
function logSpending(item) {
  const spendings = loadSpendings();
  spendings.unshift({ ...item, date: new Date().toISOString() });
  saveSpendings(spendings);
}

/**
 * Returns total spent this month from spending history.
 * @returns {number}
 */
function getTotalSpentThisMonth() {
  const now = new Date();
  const spendings = loadSpendings();
  return spendings
    .filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, s) => sum + s.amount, 0);
}

// ─── DOM References ───────────────────────────────────────────────────────────

const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");

// ─── Input Validation ─────────────────────────────────────────────────────────

function validateInputs(income, expenses, savings, inviteText) {
  if (isNaN(income) || isNaN(expenses) || isNaN(savings))
    return "Please enter valid numbers for income, expenses, and savings.";
  if (income <= 0)
    return "Income must be greater than zero.";
  if (expenses < 0 || savings < 0)
    return "Expenses and savings cannot be negative.";
  if (!inviteText || inviteText.trim().length === 0)
    return "Please paste the hangout invitation text before analyzing.";
  return null;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function showError(message) {
  resultDiv.innerHTML = `<div class="error">⚠️ <strong>Oops!</strong> ${message}</div>`;
}

function showLoading() {
  resultDiv.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Analyzing your invite + getting AI advice...</p>
    </div>
  `;
}

function riskBadge(riskLevel) {
  const config = {
    low: { emoji: "🟢", label: "LOW RISK", cls: "badge-low" },
    medium: { emoji: "🟡", label: "MEDIUM RISK", cls: "badge-medium" },
    high: { emoji: "🔴", label: "HIGH RISK", cls: "badge-high" },
  };
  const { emoji, label, cls } = config[riskLevel];
  return `<span class="risk-badge ${cls}">${emoji} ${label}</span>`;
}

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

function showResults(budget, analysis, cost, risk, recommendation, aiResult, fomoScore, totalSpentThisMonth) {
  const politeMsg = aiResult?.politeMessage || recommendation.politeMessage;
  const explanation = aiResult?.explanation || recommendation.summary;
  const advice = aiResult?.recommendation || recommendation.advice;

  // Calculate how much fun budget is left this month after existing spendings
  const remainingMonthly = Math.max(0, budget.monthlyFunBudget - totalSpentThisMonth);

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
          <li><span>Disposable Income</span>   <strong>$${budget.disposableIncome.toFixed(2)}/mo</strong></li>
          <li><span>Monthly Fun Budget</span>  <strong>$${budget.monthlyFunBudget.toFixed(2)}</strong></li>
          <li><span>Spent This Month</span>    <strong>$${totalSpentThisMonth.toFixed(2)}</strong></li>
          <li><span>Remaining This Month</span><strong>$${remainingMonthly.toFixed(2)}</strong></li>
          <li><span>Weekly Fun Budget</span>   <strong>$${budget.weeklyFunBudget.toFixed(2)}</strong></li>
        </ul>
      </div>

      <div class="result-section">
        <h3>🔍 Invitation Detected</h3>
        <ul>
          <li><span>Venue</span>          <strong>${analysis.venue ?? "Not detected"}</strong></li>
          <li><span>Category</span>       <strong>${analysis.category}</strong></li>
          <li><span>Est. Cost</span>      <strong>$${cost.minCost}–$${cost.maxCost} <em>(avg $${cost.averageCost})</em></strong></li>
          <li><span>Remaining After</span><strong>$${risk.remainingBudget.toFixed(2)}</strong></li>
        </ul>
      </div>

      <div class="result-section">
        <h3>${aiResult ? "🤖 AI Advisor" : "💡 Recommendation"}</h3>
        <p class="advice-text">${explanation}</p>
        <p class="advice-text">${advice}</p>
      </div>

      <div class="polite-message">
        <div class="polite-header">
          <h3>💬 Suggested Reply</h3>
          <button class="copy-btn" onclick="copyReply(this)">Copy</button>
        </div>
        <p id="polite-text">"${politeMsg}"</p>
      </div>

      <!-- ── Decision Buttons ───────────────────────────── -->
      <div class="decision-section" id="decision-section">
        <p class="decision-label">So... are you going?</p>
        <div class="decision-buttons">
          <button class="btn-in"  onclick="handleDecision('in',  ${cost.averageCost}, '${analysis.category}', '${analysis.venue ?? analysis.category}')">
            ✅ I'm In! <span class="btn-sub">logs $${cost.averageCost} to spending</span>
          </button>
          <button class="btn-out" onclick="handleDecision('out', ${cost.averageCost}, '${analysis.category}', '${analysis.venue ?? analysis.category}')">
            ❌ I'm Out <span class="btn-sub">budget stays intact</span>
          </button>
        </div>
      </div>

      <div class="fomo-tracker">
        <span>🙈 FOMO Score</span>
        <strong>${fomoScore} hang${fomoScore === 1 ? "out" : "outs"} skipped</strong>
      </div>

    </div>
  `;
}

// ─── Decision Handler ─────────────────────────────────────────────────────────

window.handleDecision = function (decision, cost, category, label) {
  const section = document.getElementById("decision-section");

  if (decision === "in") {
    // Log the spending
    logSpending({ label, amount: cost, category });

    // Replace decision buttons with a confirmation message
    section.innerHTML = `
      <div class="decision-confirmed in">
        ✅ Nice! <strong>$${cost}</strong> logged to your spending history.
        <br><span class="muted-text">Check Budget Tracker to see your updated totals.</span>
      </div>
    `;
  } else {
    // Increment FOMO score
    incrementFomo();
    const newFomo = getFomoScore();

    // Replace decision buttons with a confirmation message
    section.innerHTML = `
      <div class="decision-confirmed out">
        ❌ Smart move! Budget stays intact.
        <br><span class="muted-text">FOMO Score is now ${newFomo}. Your wallet thanks you. 🙏</span>
      </div>
    `;

    // Update FOMO tracker at bottom
    const fomoEl = document.querySelector(".fomo-tracker strong");
    if (fomoEl) fomoEl.textContent = `${newFomo} hang${newFomo === 1 ? "out" : "outs"} skipped`;
  }
};

// ─── Copy Reply ───────────────────────────────────────────────────────────────

window.copyReply = function (btn) {
  const text = document.getElementById("polite-text")?.innerText || "";
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 2000);
  });
};

// ─── Main: Analyze Button ─────────────────────────────────────────────────────

analyzeBtn.addEventListener("click", async () => {
  const income = Number(document.getElementById("income").value);
  const expenses = Number(document.getElementById("expenses").value);
  const savings = Number(document.getElementById("savings").value);
  const inviteText = document.getElementById("inviteText").value;

  const error = validateInputs(income, expenses, savings, inviteText);
  if (error) { showError(error); return; }

  showLoading();

  try {
    const budget = calculateBudget(income, expenses, savings);
    const analysis = analyzeInvitation(inviteText);
    const cost = estimateCost(analysis.venue, analysis.category);
    const risk = calculateRisk(cost.averageCost, budget.weeklyFunBudget);
    const recommendation = getRecommendation(risk.riskLevel, risk.percentageUsed);

    // Try AI suggestion — silently fall back if unavailable
    let aiResult = null;
    if (OPENROUTER_API_KEY !== "YOUR_OPENROUTER_API_KEY_HERE") {
      try {
        aiResult = await getAISuggestion({
          weeklyBudget: budget.weeklyFunBudget,
          estimatedCost: cost.averageCost,
          percentageUsed: risk.percentageUsed,
          riskLevel: risk.riskLevel,
          category: analysis.category,
        }, OPENROUTER_API_KEY);
      } catch (aiError) {
        console.warn("Boundly: AI suggestion failed, using local fallback.", aiError);
      }
    }

    // Get total fun spending so far this month
    const totalSpentThisMonth = getTotalSpentThisMonth();
    const fomoScore = getFomoScore();

    // Save to history log
    saveToHistory({
      date: new Date().toISOString(),
      inviteText: inviteText.trim(),
      venue: analysis.venue,
      category: analysis.category,
      averageCost: cost.averageCost,
      riskLevel: risk.riskLevel,
      percentageUsed: risk.percentageUsed,
      weeklyBudget: budget.weeklyFunBudget,
      politeMessage: aiResult?.politeMessage || recommendation.politeMessage,
    });

    showResults(budget, analysis, cost, risk, recommendation, aiResult, fomoScore, totalSpentThisMonth);

  } catch (err) {
    showError(`Something went wrong: ${err.message}`);
  }
});