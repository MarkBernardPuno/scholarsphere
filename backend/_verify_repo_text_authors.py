import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
dsn = os.getenv('DATABASE_URL', 'postgresql://postgres:admin123@localhost:5432/ScholarSphere')
conn = psycopg2.connect(dsn)
cur = conn.cursor()
cur.execute('SELECT research_repository_id, title, authors FROM research_repository ORDER BY research_repository_id DESC LIMIT 1')
print('repo', cur.fetchone())
cur.execute('SELECT publication_id, journal_name, volume_issue, doi_link FROM research_repository_publication ORDER BY publication_id DESC LIMIT 1')
print('pub', cur.fetchone())
conn.close()
