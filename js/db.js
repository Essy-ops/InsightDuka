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
    { id: 'p1', name: 'Unga wa Dola 2kg', unit: 'pkt', cost: 148, price: 175, qty: 26 },
    { id: 'p2', name: 'Sukari 1kg',        unit: 'pkt', cost: 152, price: 180, qty: 18 },
    { id: 'p3', name: 'Mafuta Elianto 1L', unit: 'btl', cost: 305, price: 360, qty: 9 }
  ];
  DB.sales = [];
  save();
}
function renderProducts() {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  DB.products.forEach(p => {
    const item = document.createElement('li');

   let text = `${p.name} — ${p.qty} ${p.unit} — KSh ${p.price} `;
if (p.qty === 0) {
  text = text + ' OUT OF STOCK ';
} else if (p.qty <= 5) {
  text = text + ' LOW STOCK ';
}
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
function sellOne(id) {
  const product = DB.products.find(p => p.id === id);

  if (product.qty <= 0) {
    alert(`${product.name} is out of stock,`);
    return;
  }
    product.qty = product.qty - 1;

    DB.sales.push({
      id: 's' + DB.sales.length,
      productId: product.id,
      price: product.price,
      cost: product.cost,
      timestamp: Date.now()
      
    });
    
    save();
    renderProducts();
    renderTodayTotal();
    renderTodayProfit();
  
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

function renderTodayTotal() {
  const el = document.getElementById('today-total');
  el.textContent = `Today's sales: KSh ${todaysSalesTotal()}`;
}
function renderTodayProfit() {
  const el = document.getElementById('today-profit');
  el.textContent = `Today's profit: KSh ${todaysProfitTotal()}`;
}