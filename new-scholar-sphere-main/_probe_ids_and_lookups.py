import json
from urllib.request import urlopen

def get(url):
    with urlopen(url, timeout=8) as r:
        return json.loads(r.read().decode('utf-8'))

base='http://localhost:8000'
rows=get(f'{base}/research-evaluations/')
look=get(f'{base}/lookups/dropdowns?resources=campuses,colleges,departments,school_years,school_semesters&limit=200&active_only=true')
print('records', len(rows))
if rows:
    s=rows[0]
    print('sample ids', {k:s.get(k) for k in ['campus_id','college_id','department_id','school_year_id','semester_id']})
print('lookup counts', {k:len(v) for k,v in look.items()})
for k in ['campuses','colleges','departments','school_years','school_semesters']:
    if look.get(k):
        print(k, 'first', look[k][0])
