import json
import urllib.parse
import urllib.request
from datetime import date

base = 'http://127.0.0.1:8000'

records = []
for i in range(1, 11):
    is_presentation = i <= 5
    output_type_id = 1 if is_presentation else 2
    research_type_id = (i % 5) + 1
    school_year_id = ((i - 1) % 5) + 1
    semester_id = ((i - 1) % 3) + 1
    department_id = 23
    title = f'Dummy Repository Record {i}'
    authors = f'Dummy Author {i}A, Dummy Author {i}B'

    fields = {
        'title': title,
        'research_type_id': str(research_type_id),
        'research_output_type_id': str(output_type_id),
        'department_id': str(department_id),
        'school_year_id': str(school_year_id),
        'semester_id': str(semester_id),
        'authors': authors,
        'status': 'Pending',
        'user_id': '4',
    }

    if is_presentation:
        fields.update({
            'conference_name': f'Dummy Conference {i}',
            'presentation_venue': f'Dummy Venue {i}',
            'presentation_date': '2026-04-05',
        })
    else:
        fields.update({
            'journal_publisher': f'Dummy Journal {i}',
            'issue_number': f'ISSN-{1000 + i}',
            'volume': f'Vol {i}',
            'doi': f'10.1234/dummy{i}',
            'manuscript_link': f'https://example.com/dummy{i}',
        })

    data = urllib.parse.urlencode(fields).encode()
    req = urllib.request.Request(f'{base}/research-database', data=data, method='POST')
    with urllib.request.urlopen(req, timeout=10) as res:
        payload = json.loads(res.read().decode())
        records.append(payload)

print(json.dumps(records, indent=2))
