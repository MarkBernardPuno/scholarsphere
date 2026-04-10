import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
dsn = os.getenv('DATABASE_URL', 'postgresql://postgres:admin123@localhost:5432/ScholarSphere')
conn = psycopg2.connect(dsn)
cur = conn.cursor()
cur.execute('SELECT research_repository_id, title FROM research_repository ORDER BY research_repository_id DESC LIMIT 1')
print('repo', cur.fetchone())
cur.execute('''
SELECT rra.research_repository_id, a.author_name, rra.author_order
FROM research_repository_authors rra
JOIN authors a ON a.author_id = rra.author_id
ORDER BY rra.research_repository_id DESC, rra.author_order ASC
LIMIT 4
''')
print('authors', cur.fetchall())
cur.execute('SELECT presentation_id, conference_name, venue FROM research_repository_presentation ORDER BY presentation_id DESC LIMIT 1')
print('presentation', cur.fetchone())
conn.close()
