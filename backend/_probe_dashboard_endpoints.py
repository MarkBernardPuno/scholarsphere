import urllib.request

urls = [
    'http://127.0.0.1:8000/research-database',
    'http://127.0.0.1:8000/research-database/',
    'http://127.0.0.1:8000/research/papers',
]

for u in urls:
    try:
        with urllib.request.urlopen(u, timeout=4) as r:
            body = r.read().decode('utf-8', errors='ignore')
            print(u, 'OK', r.status, body[:180])
    except Exception as e:
        print(u, 'ERR', e)
