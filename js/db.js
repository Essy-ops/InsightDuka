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