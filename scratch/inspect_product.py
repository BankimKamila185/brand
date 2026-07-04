import json

with open('/Users/bankimkamila/Tevar/src/data/products.json', 'r') as f:
    data = json.load(f)

for p in data['products']:
    if p['handle'] == 'denim-co-ord-set-light-blue-parachute-baggy-denim-pant-full-shirt-relaxed-fit-copy':
        print("Product Title:", p['title'])
        print("Options:", p.get('options'))
        print("Variants:", [(v.get('id'), v.get('title'), v.get('option1')) for v in p.get('variants', [])])
