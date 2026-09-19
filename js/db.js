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