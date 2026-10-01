# InsightDuka

A  simple sales and stocks tracker for small, shop owners, built with plain HTML, CSS and JavaScript. Runs entirely in the browser.

## Running it

1. clone this repository.
2. From the project folder ,in the terminal, run: `python3 -m http.server 8000`
3. Open `http://localhost:8000` in your browser.

The app loads with three seed products already in stock. All data is stored in your browser's `localStorage`, so it stays private to your device and browser.

## Features

- Add new products through a form (name, unit, cost, price, quantity, supplier lead time, safety stock)
- Record a sale with one click, which deducts stock automatically
- Stock can never go negative; the sell button disables when a product is out of stock
- Tracks today's total revenue and profit
- Calculates a reorder point per product, based on its own average daily sales over the last 14 days, not a fixed threshold
- Forecasts expected sales for each product over the next 7 days
- Flags unusual sales spikes or drops compared to a product's normal pace
- Labels each product as a Star performer, Steady seller, Slow mover, or Dead stock, based on its sales speed and profit margin relative to the shop's average

## Known limitations

- Sales spike/drop alerts compare "today so far" against a full day's average, so they can look misleading early in the day before much has been sold.
- New products with no sales history are automatically labeled "Dead stock" until they build up real sales data, this is the cold-start problem: there's no history yet to judge them by.
- All data lives in one browser's `localStorage`. It does not sync across devices, and clearing browser data will erase it.
- There is no login or multi-user support yet; anyone with access to the browser can see and edit everything.

## Analysis notebook

`notebooks/reorder-point-analysis.ipynb` walks through the reorder point formula from first principles: realistic simulated sales data, why a fixed threshold fails, the actual formula compared against it, and honest limitations. The same formula runs live in `js/db.js`.