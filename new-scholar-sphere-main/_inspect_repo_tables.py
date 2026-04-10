import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
dsn = os.getenv('DATABASE_URL', 'postgresql://postgres:admin123@localhost:5432/ScholarSphere')
conn = psycopg2.connect(dsn)
cur = conn.cursor()
for table in ['research_repository', 'research_repository_authors', 'authors', 'research_repository_presentation', 'research_repository_publication']:
    cur.execute("""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=%s
    ORDER BY ordinal_position
    """, (table,))
    rows = cur.fetchall()
    print(table, rows)
conn.close()
