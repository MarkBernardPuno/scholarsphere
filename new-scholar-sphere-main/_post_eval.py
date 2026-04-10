import os
import requests
import tempfile

url = 'http://127.0.0.1:8003/research-evaluations/'
fd, path = tempfile.mkstemp(suffix='.txt')
os.write(fd, b'test file')
os.close(fd)

payload = {
    'title_of_research': 'Flag Check Eval',
    'author_id': 'Tester',
    'campus_id': 'TIP-QC',
    'college_id': 'CCS',
    'department_id': 'BSCS',
    'school_year_id': '1',
    'semester_id': '1',
    'appointment_date': '2026-04-08',
    'appointment_time': '10:00',
}

with open(path, 'rb') as f:
    files = {
        'authorship_form': ('authorship.txt', f, 'text/plain'),
        'evaluation_form': ('evaluation.txt', f, 'text/plain'),
        'full_paper': ('fullpaper.txt', f, 'text/plain'),
        'turnitin_report': ('turnitin.txt', f, 'text/plain'),
        'grammarly_report': ('grammarly.txt', f, 'text/plain'),
        'journal_conference_info': ('journal.txt', f, 'text/plain'),
    }
    resp = requests.post(url, data=payload, files=files, timeout=60)

print(resp.status_code)
print(resp.text)
