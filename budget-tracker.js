/**
 * budget-tracker.js — Budget Tracker Page (v2)
 * Boundly / Hackonomics Project
 *
 * Reads spending history saved by app.js ("I'm In" decisions)
 * and also lets users manually log spendings here.
 */

// ─── Storage Keys (must match app.js) ────────────────────────────────────────

const BUDGET_KEY = "boundly_budget";
const SPENDING_KEY = "boundly_spendings"; // shared with app.js
const FOMO_KEY = "boundly_fomo";

// ─── Storage Helpers ──────────────────────────────────────────────────────────

function saveBudget(data) { localStorage.setItem(BUDGET_KEY, JSON.stringify(data)); }
function loadBudget() { try { return JSON.parse(localStorage.getItem(BUDGET_KEY)); } catch { return null; } }
function loadSpendings() { try { return JSON.parse(localStorage.getItem(SPENDING_KEY)) || []; } catch { return []; } }
function saveSpendings(arr) { localStorage.setItem(SPENDING_KEY, JSON.stringify(arr)); }
function getFomoScore() { return parseInt(localStorage.getItem(FOMO_KEY) || "0"); }

// ─── Month Filter ─────────────────────────────────────────────────────────────

/**
 * Returns only spendings from the current month.
 * @returns {Array}
 */
function getThisMonthSpendings() {
  const now = new Date();
  return loadSpendings().filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

// ─── Budget Health Score ──────────────────────────────────────────────────────

function calcHealthScore(funBudget, totalSpent, income, savings, fomoScore) {
  const remainingRatio = Math.max(0, (funBudget - totalSpent) / funBudget);
  const budgetPoints = Math.round(remainingRatio * 50);
  const savingsPoints = Math.round(Math.min(savings / income, 1) * 30);
  const fomoPenalty = Math.min(fomoScore * 2, 20);
  return Math.max(0, Math.min(100, budgetPoints + savingsPoints - fomoPenalty));
}

function healthLabel(score) {
  if (score >= 75) return { label: "Excellent 🌟", cls: "health-great" };
  if (score >= 50) return { label: "Good 👍", cls: "health-good" };
  if (score >= 25) return { label: "Watch Out ⚠️", cls: "health-warn" };
  return { label: "Critical 🔴", cls: "health-danger" };
}

// ─── Render: Health Score ─────────────────────────────────────────────────────

function renderHealthScore() {
  const el = document.getElementById("health-display");
  const budget = loadBudget();
  if (!budget) {
    el.innerHTML = `<p class="muted-text">Set your budget below to see your score.</p>`;
    return;
  }

  const spendings = getThisMonthSpendings();
  const totalSpent = spendings.reduce((sum, s) => sum + s.amount, 0);
  const fomoScore = getFomoScore();
  const score = calcHealthScore(budget.monthlyFunBudget, totalSpent, budget.income, budget.savings, fomoScore);
  const { label, cls } = healthLabel(score);
  const barCls = cls === "health-great" || cls === "health-good" ? "progress-low"
    : cls === "health-warn" ? "progress-medium" : "progress-high";

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
        <div class="progress-fill ${barCls}" style="width:${score}%"></div>
      </div>
    </div>
    <ul class="health-breakdown">
      <li><span>Monthly fun budget</span> <strong>$${budget.monthlyFunBudget.toFixed(2)}</strong></li>
      <li><span>Spent this month</span>   <strong>$${totalSpent.toFixed(2)}</strong></li>
      <li><span>Remaining</span>          <strong>$${Math.max(0, budget.monthlyFunBudget - totalSpent).toFixed(2)}</strong></li>
    </ul>
  `;
}

// ─── Render: Spending Overview ────────────────────────────────────────────────

function renderSpendingOverview() {
  const el = document.getElementById("spending-overview");
  const budget = loadBudget();
  const all = loadSpendings();         // ALL spendings ever
  const monthly = getThisMonthSpendings(); // this month only

  if (all.length === 0) {
    el.innerHTML = `
      <p class="muted-text">No spendings yet. Go analyze an invite and hit "I'm In!" 🎉</p>
    `;
    return;
  }

  const totalSpent = monthly.reduce((sum, s) => sum + s.amount, 0);
  const funBudget = budget?.monthlyFunBudget || 0;

  // Group this month's spendings by category
  const byCategory = {};
  for (const s of monthly) {
    if (!byCategory[s.category]) byCategory[s.category] = 0;
    byCategory[s.category] += s.amount;
  }

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

  // Full spending list (all time), newest first
  const itemList = all.map((s, i) => {
    const date = new Date(s.date);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const source = s.source === "manual" ? "manual" : "from analyze";
    return `
      <li>
        <span>
          ${s.label}
          <em class="muted-text">(${s.category})</em>
          <span class="source-tag">${source}</span>
        </span>
        <span>
          <span class="muted-text" style="font-size:0.8rem">${dateStr}</span>
          <strong>$${s.amount.toFixed(2)}</strong>
          <button class="delete-btn" onclick="deleteSpending(${i})">✕</button>
        </span>
      </li>
    `;
  }).join("");

  el.innerHTML = `
    <div class="result-section">
      <h3>This month by category</h3>
      ${categoryRows.length > 0 ? categoryRows : '<p class="muted-text">No spendings logged this month yet.</p>'}
    </div>
    <div class="result-section" style="margin-top:16px">
      <h3>All history <span class="muted-text total-label">Total this month: $${totalSpent.toFixed(2)}</span></h3>
      <ul class="spending-list">${itemList}</ul>
    </div>
  `;
}

// ─── Render: FOMO Score ───────────────────────────────────────────────────────

function renderFomo() {
  const el = document.getElementById("fomo-display");
  const score = getFomoScore();
  const msg = score === 0 ? "No hangouts skipped yet — you're living your best life! 🎉"
    : score < 3 ? `You've skipped ${score} hangout${score > 1 ? "s" : ""} to protect your budget. Respect. 💪`
      : `You've said no to ${score} hangouts this month. Your wallet thanks you. 🙏`;

  el.innerHTML = `
    <div class="fomo-tracker">
      <span>🙈 FOMO Score</span>
      <strong>${score}</strong>
    </div>
    <p class="advice-text" style="margin-top:8px">${msg}</p>
  `;
}

// ─── Delete Spending ──────────────────────────────────────────────────────────

window.deleteSpending = function (index) {
  const spendings = loadSpendings();
  spendings.splice(index, 1);
  saveSpendings(spendings);
  renderAll();
};

// ─── Render All ───────────────────────────────────────────────────────────────

function renderAll() {
  renderHealthScore();
  renderSpendingOverview();
  renderFomo();
}

// ─── Event: Save Budget ───────────────────────────────────────────────────────

document.getElementById("setBudgetBtn").addEventListener("click", () => {
  const income = Number(document.getElementById("bt-income").value);
  const expenses = Number(document.getElementById("bt-expenses").value);
  const savings = Number(document.getElementById("bt-savings").value);

  if (!income || income <= 0) { alert("Please enter a valid income."); return; }
  if (expenses < 0 || savings < 0) { alert("Expenses and savings cannot be negative."); return; }
  if (expenses + savings > income) { alert("Expenses + savings exceed income."); return; }

  const disposable = income - expenses - savings;
  const monthlyFunBudget = disposable;
  const weeklyFunBudget = parseFloat((disposable / 4.33).toFixed(2));

  saveBudget({ income, expenses, savings, disposable, monthlyFunBudget, weeklyFunBudget });

  const btn = document.getElementById("setBudgetBtn");
  btn.textContent = "Saved ✓";
  setTimeout(() => btn.textContent = "Save Budget", 2000);

  renderAll();
});

// ─── Event: Manual Log Spending ───────────────────────────────────────────────

document.getElementById("logSpendBtn").addEventListener("click", () => {
  const label = document.getElementById("spend-label").value.trim();
  const amount = Number(document.getElementById("spend-amount").value);
  const category = document.getElementById("spend-category").value;

  if (!label) { alert("Please describe what you spent on."); return; }
  if (!amount || amount <= 0) { alert("Please enter a valid amount."); return; }

  const spendings = loadSpendings();
  // Mark as "manual" so history list can label it differently
  spendings.unshift({ label, amount, category, date: new Date().toISOString(), source: "manual" });
  saveSpendings(spendings);

  document.getElementById("spend-label").value = "";
  document.getElementById("spend-amount").value = "";

  const btn = document.getElementById("logSpendBtn");
  btn.textContent = "Logged ✓";
  setTimeout(() => btn.textContent = "Log Spending", 2000);

  renderAll();
});

// ─── Init ─────────────────────────────────────────────────────────────────────

const saved = loadBudget();
if (saved) {
  document.getElementById("bt-income").value = saved.income;
  document.getElementById("bt-expenses").value = saved.expenses;
  document.getElementById("bt-savings").value = saved.savings;
}

renderAll();