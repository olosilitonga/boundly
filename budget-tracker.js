/**
 * budget-tracker.js — Budget Tracker Page Logic
 * Boundly / Hackonomics Project
 *
 * Features:
 * - Save & load monthly budget from localStorage
 * - Log individual spendings with category
 * - Show spending breakdown per category with progress bars
 * - Budget Health Score (0–100)
 * - FOMO Score from analyze page
 */

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const BUDGET_KEY   = "boundly_budget";
const SPENDING_KEY = "boundly_spendings";
const FOMO_KEY     = "boundly_fomo";

// ─── Storage Helpers ──────────────────────────────────────────────────────────

function saveBudget(data)    { localStorage.setItem(BUDGET_KEY,   JSON.stringify(data)); }
function loadBudget()        { try { return JSON.parse(localStorage.getItem(BUDGET_KEY)); } catch { return null; } }
function loadSpendings()     { try { return JSON.parse(localStorage.getItem(SPENDING_KEY)) || []; } catch { return []; } }
function saveSpendings(arr)  { localStorage.setItem(SPENDING_KEY, JSON.stringify(arr)); }
function getFomoScore()      { return parseInt(localStorage.getItem(FOMO_KEY) || "0"); }

// ─── Budget Health Score ──────────────────────────────────────────────────────

/**
 * Calculates a Budget Health Score from 0–100.
 *
 * Factors:
 * - How much of the fun budget is still remaining (50pts)
 * - Savings ratio: savings / income (30pts)
 * - FOMO penalty: each skipped hangout = -2pts (max -20)
 *
 * @param {number} funBudget     - Monthly fun budget
 * @param {number} totalSpent    - Total spent this month
 * @param {number} income        - Monthly income
 * @param {number} savings       - Monthly savings target
 * @param {number} fomoScore     - Number of declined hangouts
 * @returns {number} Score 0–100
 */
function calcHealthScore(funBudget, totalSpent, income, savings, fomoScore) {
  // Factor 1: remaining fun budget (max 50pts)
  const remainingRatio  = Math.max(0, (funBudget - totalSpent) / funBudget);
  const budgetPoints    = Math.round(remainingRatio * 50);

  // Factor 2: savings discipline (max 30pts)
  const savingsRatio    = Math.min(savings / income, 1);
  const savingsPoints   = Math.round(savingsRatio * 30);

  // Factor 3: FOMO penalty (max -20pts)
  const fomoPenalty     = Math.min(fomoScore * 2, 20);

  return Math.max(0, Math.min(100, budgetPoints + savingsPoints - fomoPenalty));
}

/**
 * Returns a label + color class based on health score.
 * @param {number} score
 * @returns {{ label: string, cls: string }}
 */
function healthLabel(score) {
  if (score >= 75) return { label: "Excellent 🌟", cls: "health-great"  };
  if (score >= 50) return { label: "Good 👍",       cls: "health-good"   };
  if (score >= 25) return { label: "Watch Out ⚠️",  cls: "health-warn"   };
  return              { label: "Critical 🔴",        cls: "health-danger" };
}

// ─── Render: Health Score ─────────────────────────────────────────────────────

function renderHealthScore() {
  const el       = document.getElementById("health-display");
  const budget   = loadBudget();
  if (!budget) { el.innerHTML = `<p class="muted-text">Set your budget below to see your score.</p>`; return; }

  const spendings  = loadSpendings();
  const totalSpent = spendings.reduce((sum, s) => sum + s.amount, 0);
  const fomoScore  = getFomoScore();
  const funBudget  = budget.monthlyFunBudget;

  const score = calcHealthScore(funBudget, totalSpent, budget.income, budget.savings, fomoScore);
  const { label, cls } = healthLabel(score);

  el.innerHTML = `
    <div class="health-score-wrap">
      <div class="health-score-number ${cls}">${score}</div>
      <div class="health-score-meta">
        <span class="health-label ${cls}">${label}</span>
        <span class="muted-text">out of 100</span>
      </div>
    </div>
    <div class="progress-wrap" style="margin-top:12px">
      <div class="progress-track">
        <div class="progress-fill ${cls === 'health-great' || cls === 'health-good' ? 'progress-low' : cls === 'health-warn' ? 'progress-medium' : 'progress-high'}"
             style="width:${score}%"></div>
      </div>
    </div>
    <ul class="health-breakdown">
      <li><span>Monthly fun budget</span><strong>$${funBudget.toFixed(2)}</strong></li>
      <li><span>Total spent this month</span><strong>$${totalSpent.toFixed(2)}</strong></li>
      <li><span>Remaining fun budget</span><strong>$${Math.max(0, funBudget - totalSpent).toFixed(2)}</strong></li>
    </ul>
  `;
}

// ─── Render: Spending Overview ────────────────────────────────────────────────

function renderSpendingOverview() {
  const el        = document.getElementById("spending-overview");
  const spendings = loadSpendings();
  const budget    = loadBudget();

  if (spendings.length === 0) {
    el.innerHTML = `<p class="muted-text">No spendings logged yet.</p>`;
    return;
  }

  // Group by category
  const byCategory = {};
  for (const s of spendings) {
    if (!byCategory[s.category]) byCategory[s.category] = 0;
    byCategory[s.category] += s.amount;
  }

  const totalSpent   = spendings.reduce((sum, s) => sum + s.amount, 0);
  const funBudget    = budget?.monthlyFunBudget || 0;

  // Build category bars
  const categoryRows = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => {
      const pct = funBudget > 0 ? Math.min(Math.round((amount / funBudget) * 100), 100) : 0;
      return `
        <div class="category-row">
          <div class="category-meta">
            <span class="category-name">${cat}</span>
            <span class="category-amount">$${amount.toFixed(2)} <em>(${pct}%)</em></span>
          </div>
          <div class="progress-track">
            <div class="progress-fill progress-medium" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    }).join("");

  // Individual spending list
  const itemList = spendings.map((s, i) => `
    <li>
      <span>${s.label} <em class="muted-text">(${s.category})</em></span>
      <span>
        <strong>$${s.amount.toFixed(2)}</strong>
        <button class="delete-btn" onclick="deleteSpending(${i})">✕</button>
      </span>
    </li>
  `).join("");

  el.innerHTML = `
    <div class="result-section">
      <h3>By Category</h3>
      ${categoryRows}
    </div>
    <div class="result-section" style="margin-top:16px">
      <h3>All Items <span class="muted-text total-label">Total: $${totalSpent.toFixed(2)}</span></h3>
      <ul class="spending-list">${itemList}</ul>
    </div>
  `;
}

// ─── Render: FOMO Score ───────────────────────────────────────────────────────

function renderFomo() {
  const el    = document.getElementById("fomo-display");
  const score = getFomoScore();

  const message = score === 0
    ? "No hangouts skipped yet — you're living your best life! 🎉"
    : score < 3
    ? `You've skipped ${score} hangout${score > 1 ? "s" : ""} to protect your budget. Respect. 💪`
    : `You've said no to ${score} hangouts this month. Your wallet thanks you. 🙏`;

  el.innerHTML = `
    <div class="fomo-tracker">
      <span>🙈 FOMO Score</span>
      <strong>${score}</strong>
    </div>
    <p class="advice-text" style="margin-top:8px">${message}</p>
  `;
}

// ─── Delete Spending ──────────────────────────────────────────────────────────

window.deleteSpending = function(index) {
  const spendings = loadSpendings();
  spendings.splice(index, 1);
  saveSpendings(spendings);
  renderAll();
};

// ─── Render All ──────────────────────────────────────────────────────────────

function renderAll() {
  renderHealthScore();
  renderSpendingOverview();
  renderFomo();
}

// ─── Event: Save Budget ───────────────────────────────────────────────────────

document.getElementById("setBudgetBtn").addEventListener("click", () => {
  const income   = Number(document.getElementById("bt-income").value);
  const expenses = Number(document.getElementById("bt-expenses").value);
  const savings  = Number(document.getElementById("bt-savings").value);

  if (!income || income <= 0) { alert("Please enter a valid income."); return; }
  if (expenses < 0 || savings < 0) { alert("Expenses and savings cannot be negative."); return; }
  if (expenses + savings > income) { alert("Expenses + savings exceed income. Please check your numbers."); return; }

  const disposable       = income - expenses - savings;
  const monthlyFunBudget = disposable;
  const weeklyFunBudget  = parseFloat((disposable / 4.33).toFixed(2));

  saveBudget({ income, expenses, savings, disposable, monthlyFunBudget, weeklyFunBudget });

  document.getElementById("setBudgetBtn").textContent = "Saved ✓";
  setTimeout(() => document.getElementById("setBudgetBtn").textContent = "Save Budget", 2000);

  renderAll();
});

// ─── Event: Log Spending ──────────────────────────────────────────────────────

document.getElementById("logSpendBtn").addEventListener("click", () => {
  const label    = document.getElementById("spend-label").value.trim();
  const amount   = Number(document.getElementById("spend-amount").value);
  const category = document.getElementById("spend-category").value;

  if (!label)       { alert("Please describe what you spent on."); return; }
  if (!amount || amount <= 0) { alert("Please enter a valid amount."); return; }

  const spendings = loadSpendings();
  spendings.unshift({ label, amount, category, date: new Date().toISOString() });
  saveSpendings(spendings);

  // Clear inputs
  document.getElementById("spend-label").value  = "";
  document.getElementById("spend-amount").value = "";

  document.getElementById("logSpendBtn").textContent = "Logged ✓";
  setTimeout(() => document.getElementById("logSpendBtn").textContent = "Log Spending", 2000);

  renderAll();
});

// ─── Init ─────────────────────────────────────────────────────────────────────

// Pre-fill inputs if budget already saved
const saved = loadBudget();
if (saved) {
  document.getElementById("bt-income").value   = saved.income;
  document.getElementById("bt-expenses").value = saved.expenses;
  document.getElementById("bt-savings").value  = saved.savings;
}

renderAll();
