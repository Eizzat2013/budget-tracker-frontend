let transactions = [];

// DOM Elements
const descEl = document.getElementById('desc');
const amountEl = document.getElementById('amount');
const categoryEl = document.getElementById('category');
const typeEl = document.getElementById('type');
const dateEl = document.getElementById('date');
const addBtn = document.getElementById('addBtn');

const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const balanceEl = document.getElementById('balance');
const largestDayEl = document.getElementById('largestDay');
const averageDailyEl = document.getElementById('averageDaily');
const carryForwardEl = document.getElementById('carryForward');

const tableBody = document.querySelector('#transactionsTable tbody');

const pieCtx = document.getElementById('pieChart').getContext('2d');
const lineCtx = document.getElementById('lineChart').getContext('2d');

let pieChart, lineChart;

// Dark/Light Mode
document.getElementById('toggleTheme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Add Transaction
addBtn.addEventListener('click', () => {
  const desc = descEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const category = categoryEl.value;
  const type = typeEl.value;
  const date = dateEl.value;

  if (!desc || isNaN(amount) || !date) {
    alert("Please enter valid data!");
    return;
  }

  transactions.push({desc, amount, category, type, date});
  clearInputs();
  updateTable();
  updateDashboard();
});

function clearInputs() {
  descEl.value = '';
  amountEl.value = '';
  categoryEl.value = 'Food';
  typeEl.value = 'expense';
  dateEl.value = '';
}

// Update Table
function updateTable() {
  tableBody.innerHTML = '';
  transactions.forEach((t, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.desc}</td>
      <td>${t.category}</td>
      <td>${t.type}</td>
      <td>${t.amount.toFixed(2)}</td>
      <td>
        <button onclick="deleteTransaction(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Delete transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  updateTable();
  updateDashboard();
}

// Update Dashboard
function updateDashboard() {
  const totalIncome = transactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  totalIncomeEl.innerText = totalIncome.toFixed(2);
  totalExpensesEl.innerText = totalExpenses.toFixed(2);
  balanceEl.innerText = balance.toFixed(2);

  // Largest spending day
  const expenseByDay = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expenseByDay[t.date] = (expenseByDay[t.date] || 0) + t.amount;
  });
  const largestDay = Object.entries(expenseByDay)
                          .sort((a,b) => b[1]-a[1])[0];
  largestDayEl.innerText = largestDay ? `${largestDay[0]} (${largestDay[1].toFixed(2)})` : '-';

  // Average daily usage
  const days = new Set(transactions.map(t => t.date));
  averageDailyEl.innerText = days.size ? (totalExpenses/days.size).toFixed(2) : 0;

  // Carry forward
  const carryForward = balance;
  carryForwardEl.innerText = carryForward.toFixed(2);

  updateCharts();
}

// Charts
function updateCharts() {
  const categories = [...new Set(transactions.map(t => t.category))];
  const categoryData = categories.map(cat => {
    return transactions.filter(t => t.category===cat && t.type==='expense')
                       .reduce((sum,t)=>sum+t.amount,0);
  });

  if(pieChart) pieChart.destroy();
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{data: categoryData, backgroundColor:['#FF6384','#36A2EB','#FFCE56','#4BC0C0']}]
    }
  });

  // Line chart: daily expenses
  const daily = {};
  transactions.filter(t=>t.type==='expense').forEach(t=>{
    daily[t.date] = (daily[t.date]||0)+t.amount;
  });
  const sortedDates = Object.keys(daily).sort();
  const dailyValues = sortedDates.map(d=>daily[d]);

  if(lineChart) lineChart.destroy();
  lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: sortedDates,
      datasets: [{label:'Daily Expenses', data:dailyValues, borderColor:'#FF6384', fill:false}]
    }
  });
}
