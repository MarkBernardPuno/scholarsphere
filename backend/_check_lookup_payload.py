import requests
base='http://localhost:8000'
urls=[
    f"{base}/lookups/dropdowns?resources=campuses,colleges,departments,school_years,school_semesters&limit=200&active_only=true",
    f"{base}/lookups/dropdowns?resources=campuses,colleges,departments,school_years,school_semesters&limit=200&active_only=false",
]
for u in urls:
    print('URL:',u)
    try:
        r=requests.get(u,timeout=5)
        print('status',r.status_code)
        if r.ok:
            d=r.json()
            print('counts', {k: len(v) for k,v in d.items()})
            if d.get('colleges'):
                print('sample college', d['colleges'][0])
            if d.get('departments'):
                print('sample dept', d['departments'][0])
            if d.get('school_years'):
                print('sample year', d['school_years'][0])
            if d.get('school_semesters'):
                print('sample sem', d['school_semesters'][0])
        else:
            print(r.text)
    except Exception as e:
        print('error',e)
    print('---')
