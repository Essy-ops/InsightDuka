const KEY = 'insightduka.v1';

let DB = {
  products: [],
  sales: []
};

let editingProductId = null;

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
item.textContent = text;

if (p.qty === 0) {
  const warning = document.createElement('span');
  warning.textContent = ' OUT OF STOCK ';
  warning.style.color = 'red';
  warning.style.fontWeight = 'bold';
  item.appendChild(warning);
} else if (p.qty <= rp) {
  const warning = document.createElement('span');
  warning.textContent = `LOW STOCK (reorder point: ${rp}) `;
  warning.style.color = 'orange';
  warning.style.fontWeight = 'bold';
  item.appendChild(warning);
}

const anomaly = checkAnomaly(p.id);
if (anomaly === 'spike') {
  const warning = document.createElement('span');
  warning.textContent = ' SALES SPIKE ';
  warning.style.color = 'green';
  warning.style.fontWeight = 'bold';
  item.appendChild(warning);
} else if (anomaly === 'drop') {
  const warning = document.createElement('span');
  warning.textContent = ' SALES DROP ';
  warning.style.color = 'red';
  warning.style.fontWeight = 'bold';
  item.appendChild(warning);
}

const labelSpan = document.createElement('span');
labelSpan.textContent = ` [${productLabel(p)}]`;
labelSpan.style.color = '#1e6fb8';
item.appendChild(labelSpan);
    const button = document.createElement('button');
    button.textContent = 'Sell 1';
    button.disabled = (p.qty === 0);
    button.onclick = function () {
      sellOne(p.id);
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function () {
      deleteProduct(p.id);
    };
    
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = function () {
      editProduct(p.id);
    };

   item.appendChild(button);
   item.appendChild(editButton);
   item.appendChild(deleteButton);
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

  if (editingProductId === null) {
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
  } else {
    const product = DB.products.find(p => p.id === editingProductId);
    product.name = name;
    product.unit = unit;
    product.cost = cost;
    product.price = price;
    product.qty = qty;
    product.leadDays = leadDays;
    product.safetyStock = safetyStock;
    editingProductId = null;
    document.getElementById('form-submit-button').textContent = 'Add product';
  }

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

function deleteProduct(id) {
  const product = DB.products.find(p => p.id === id);
  const confirmed = confirm(`Delete ${product.name}? This cannot be undone.`);

  if (!confirmed) {
    return;
  }

  DB.products = DB.products.filter(p => p.id !== id);
  save();
  renderProducts();
}

function editProduct(id) {
  const product = DB.products.find(p => p.id === id);

  document.getElementById('new-name').value = product.name;
  document.getElementById('new-unit').value = product.unit;
  document.getElementById('new-cost').value = product.cost;
  document.getElementById('new-price').value = product.price;
  document.getElementById('new-qty').value = product.qty;
  document.getElementById('new-lead').value = product.leadDays;
  document.getElementById('new-safety').value = product.safetyStock;

  editingProductId = id;
  document.getElementById('form-submit-button').textContent = 'Save changes';
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
    renderSalesHistory();
  
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
function renderSalesHistory() {
  const list = document.getElementById('sales-list');
  list.innerHTML = '';

  const filter = document.getElementById('history-filter').value;
  const now = new Date();
  let cutoff = 0;

  if (filter === 'today') {
    cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  } else if (filter === 'week') {
    cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
  }

  const filteredSales = DB.sales.filter(sale => sale.timestamp >= cutoff);
  const recentSales = filteredSales.slice(-10).reverse();

  recentSales.forEach(sale => {
    const product = DB.products.find(p => p.id === sale.productId);
    const productName = product ? product.name : 'Unknown product';

    const item = document.createElement('li');
    const time = new Date(sale.timestamp).toLocaleString();
    item.textContent = `${time} — ${productName} — KSh ${sale.price} — ${sale.method}`;

    list.appendChild(item);
  });
}