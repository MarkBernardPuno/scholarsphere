import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
dsn = os.getenv('DATABASE_URL', 'postgresql://postgres:admin123@localhost:5432/ScholarSphere')
conn = psycopg2.connect(dsn)
cur = conn.cursor()
cur.execute('''
SELECT evaluation_id,
       is_authorship_verified,
       is_evaluation_form_verified,
       is_full_paper_verified,
       is_turnitin_verified,
       is_grammarly_verified,
       is_journal_info_verified
FROM research_evaluations
ORDER BY evaluation_id DESC
LIMIT 3
''')
for row in cur.fetchall():
    print(row)
conn.close()
