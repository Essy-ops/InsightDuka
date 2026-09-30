const KEY = 'insightduka.v1';

let DB = {
  products: [],
  sales: []
};

function save() {
  localStorage.setItem(KEY, JSON.stringify(DB));
}

function load() {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    DB = JSON.parse(raw);
  }
}
function seed() {
  DB.products = [
    { id: 'p1', name: 'Unga wa Dola 2kg', unit: 'pkt', cost: 148, price: 175, qty: 26, leadDays: 3, safetyStock: 5 },
    { id: 'p2', name: 'Sukari 1kg',        unit: 'pkt', cost: 152, price: 180, qty: 18, leadDays: 3, safetyStock: 5 },
    { id: 'p3', name: 'Mafuta Elianto 1L', unit: 'btl', cost: 305, price: 360, qty: 9, leadDays: 4, safetyStock: 3 }
  ];
  DB.sales = [];
  save();
}

function renderProducts() {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  DB.products.forEach(p => {
    const item = document.createElement('li');
const rp = reorderPoint(p.id, p.leadDays, p.safetyStock);
const forecast = forecastNextDays(p.id, 7);

let text = `${p.name} — ${p.qty} ${p.unit} — KSh ${p.price} - expected next 7 days: ${forecast} `;
if (p.qty === 0) {
  text = text + ' OUT OF STOCK ';
} else if (p.qty <= rp) {
  text = text + `LOW STOCK (reorder point: ${rp}) `;
}
const anomaly = checkAnomaly(p.id);
if (anomaly === 'spike') {
  text = text + ' SALES SPIKE ';
} else if (anomaly === 'drop') {
  text = text + ' SALES DROP ';
}
text = text + `[${productLabel(p)}]`;
item.textContent = text;

    const button = document.createElement('button');
    button.textContent = 'Sell 1';
    button.disabled = (p.qty === 0);
    button.onclick = function () {
      sellOne(p.id);
    };

    item.appendChild(button);
    list.appendChild(item);
  });
}
function productLabel(p) {
  const velocity = averageDailySales(p.id, 14);
  const margin = (p.price - p.cost) / p.price;

  if (velocity === 0) {
    return 'Dead stock';
  }

  let total = 0;
  DB.products.forEach(product => {
    total = total + averageDailySales(product.id, 14);
  });
  const shopAverage = total / DB.products.length;

  if (velocity >= shopAverage && margin >= 0.15) {
    return 'Star performer';
  }
  if (velocity >= shopAverage) {
    return 'Steady seller';
  }
  return 'Slow mover';
}


function addProduct() {
  const name = document.getElementById('new-name').value;
  const unit = document.getElementById('new-unit').value;
  const cost = Number(document.getElementById('new-cost').value);
  const price = Number(document.getElementById('new-price').value);
  const qty = Number(document.getElementById('new-qty').value);
  const leadDays = Number(document.getElementById('new-lead').value);
  const safetyStock = Number(document.getElementById('new-safety').value);

  if (name === '' || unit === '') {
    alert('Please enter a name and unit.');
    return;
  }

  const newProduct = {
    id: 'p' + Date.now(),
    name: name,
    unit: unit,
    cost: cost,
    price: price,
    qty: qty,
    leadDays: leadDays,
    safetyStock: safetyStock
  };

  DB.products.push(newProduct);
  save();
  renderProducts();

  document.getElementById('new-name').value = '';
  document.getElementById('new-unit').value = '';
  document.getElementById('new-cost').value = '';
  document.getElementById('new-price').value = '';
  document.getElementById('new-qty').value = '';
  document.getElementById('new-lead').value = '';
  document.getElementById('new-safety').value = '';
}
function sellOne(id) {
  const product = DB.products.find(p => p.id === id);

  if (product.qty <= 0) {
    alert(`${product.name} is out of stock,`);
    return;
  }
    product.qty = product.qty - 1;

    const method = document.getElementById('payment-method').value;

    DB.sales.push({
      id: 's' + DB.sales.length,
      productId: product.id,
      price: product.price,
      cost: product.cost,
      method: method,
      timestamp: Date.now()
      
    });
    
    save();
    renderProducts();
    renderTodayTotal();
    renderTodayProfit();
    renderPaymentBreakdown();
  
}
function todaysSalesTotal() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todaysSales = DB.sales.filter(sale => sale.timestamp >= todayStart);
  let total = 0;
  todaysSales.forEach(sale => {
    total = total + sale.price;
  });
  return total;
}
function todaysProfitTotal() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todaysSales = DB.sales.filter(sale => sale.timestamp >= todayStart);

  let profit = 0;
  todaysSales.forEach(sale => {
    profit = profit + (sale.price - sale.cost);
  });
  return profit;
}
function todaysSalesByMethod(method) {

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todaysSales = DB.sales.filter(sale => sale.timestamp >= todayStart && sale.method === method);

  let total = 0;
  todaysSales.forEach(sale => {
    total = total + sale.price;
  });
  return total;
}
function averageDailySales(productId, days) {
  const now = Date.now();
  const windowStart = now - (days * 24 * 60 * 60 * 1000);

  const salesInWindow = DB.sales.filter(sale =>
    sale.productId === productId && sale.timestamp >= windowStart
  );

  let unitsSold = salesInWindow.length;
  return unitsSold / days;
}
function reorderPoint(productId, leadDays, safetyStock) {
  const avgDaily = averageDailySales(productId, 14);
  return Math.ceil(avgDaily * leadDays + safetyStock);
}
function forecastNextDays(productId, days) {
  const avgDaily = averageDailySales(productId, 14);
  return Math.round(avgDaily * days);
}
function unitsSoldToday(productId) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const todaysSales = DB.sales.filter(sale =>
    sale.productId === productId && sale.timestamp >= todayStart
  );

  return todaysSales.length;
}
function checkAnomaly(productId) {
  const today = unitsSoldToday(productId);
  const average = averageDailySales(productId, 14);

  if (average === 0) {
    return null;
  }

  if (today >= average * 2) {
    return 'spike';
  }
  if (today <= average * 0.5) {
    return 'drop';
  }
  return null;
}
function seedHistoricalSales(productId, daysBack, unitsPerDay) {
  const product = DB.products.find(p => p.id === productId);

  for (let i = 1; i <= daysBack; i++) {
    const saleTime = Date.now() - (i * 24 * 60 * 60 * 1000);

    for (let j = 0; j < unitsPerDay; j++) {
      DB.sales.push({
        id: 's' + DB.sales.length,
        productId: productId,
        price: product.price,
        cost: product.cost,
        timestamp: saleTime
      });
    }
  }

  save();
}

function renderTodayTotal() {
  const el = document.getElementById('today-total');
  el.textContent = `Today's sales: KSh ${todaysSalesTotal()}`;
}
function renderTodayProfit() {
  const el = document.getElementById('today-profit');
  el.textContent = `Today's profit: KSh ${todaysProfitTotal()}`;
}
function renderPaymentBreakdown() {
  const el = document.getElementById('payment-breakdown');
  const methods = ['Cash', 'M-Pesa', 'Card', 'Credit'];

  let html = '<ul>';
  methods.forEach(method => {
    const total = todaysSalesByMethod(method);
    html = html + `<li>${method}: KSh ${total}</li>`;
  });
  html = html + '</ul>';

  el.innerHTML = html;
}