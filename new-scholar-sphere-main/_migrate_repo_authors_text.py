import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
dsn = os.getenv('DATABASE_URL', 'postgresql://postgres:admin123@localhost:5432/ScholarSphere')
conn = psycopg2.connect(dsn)
cur = conn.cursor()

cur.execute("""
ALTER TABLE research_repository
ADD COLUMN IF NOT EXISTS authors TEXT
""")

cur.execute("""
UPDATE research_repository rr
SET authors = src.authors
FROM (
    SELECT
        rra.research_repository_id,
        STRING_AGG(a.author_name, ', ' ORDER BY rra.author_order) AS authors
    FROM research_repository_authors rra
    JOIN authors a ON a.author_id = rra.author_id
    GROUP BY rra.research_repository_id
) src
WHERE rr.research_repository_id = src.research_repository_id
  AND (rr.authors IS NULL OR rr.authors = '')
""")

cur.execute("""
UPDATE research_repository
SET authors = 'Unknown Author'
WHERE authors IS NULL OR authors = ''
""")

cur.execute("""
ALTER TABLE research_repository
ALTER COLUMN authors SET NOT NULL
""")

conn.commit()

cur.execute("SELECT research_repository_id, title, authors FROM research_repository ORDER BY research_repository_id DESC LIMIT 5")
print(cur.fetchall())
conn.close()
