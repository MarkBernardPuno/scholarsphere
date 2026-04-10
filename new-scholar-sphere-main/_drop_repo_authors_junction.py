import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
dsn = os.getenv('DATABASE_URL', 'postgresql://postgres:admin123@localhost:5432/ScholarSphere')
conn = psycopg2.connect(dsn)
cur = conn.cursor()
cur.execute('DROP TABLE IF EXISTS research_repository_authors')
conn.commit()
cur.execute("""
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema='public' AND table_name='research_repository_authors'
)
""")
print('junction_exists', cur.fetchone()[0])
conn.close()
