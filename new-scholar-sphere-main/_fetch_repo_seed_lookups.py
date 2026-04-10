import json
from urllib.request import urlopen
base='http://127.0.0.1:8000'
path='/lookups/dropdowns?resources=school_years,school_semesters,research_output_types,research_types&active_only=false&limit=100'
with urlopen(base+path, timeout=10) as r:
    data=json.loads(r.read().decode())
print(json.dumps(data, indent=2))
