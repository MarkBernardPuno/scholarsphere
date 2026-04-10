import urllib.request
urls=[
 'http://127.0.0.1:8000/authors/',
 'http://127.0.0.1:8000/research-database',
 'http://127.0.0.1:8000/lookups/dropdowns?resources=campuses'
]
for u in urls:
  try:
    with urllib.request.urlopen(u,timeout=4) as r:
      b=r.read().decode('utf-8','ignore')
      print(u,'OK',r.status,b[:140])
  except Exception as e:
    print(u,'ERR',e)
