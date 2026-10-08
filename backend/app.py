from flask import Flask, jsonify

app = Flask(__name__)

products = [
    {'id': 'p1', 'name': 'Unga wa Dola 2kg', 'unit': 'pkt', 'cost': 148, 'price': 175, 'qty': 26, 'leadDays': 3, 'safetyStock': 5},
    {'id': 'p2', 'name': 'Sukari 1kg', 'unit': 'pkt', 'cost': 152, 'price': 180, 'qty': 18, 'leadDays': 3, 'safetyStock': 5},
    {'id': 'p3', 'name': 'Mafuta Elianto 1L', 'unit': 'btl', 'cost': 305, 'price': 360, 'qty': 9, 'leadDays': 4, 'safetyStock': 3}
]

@app.route('/')
def home():
    return 'InsightDuka backend is running'

@app.route('/api/products')
def get_products():
    return jsonify(products)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
    