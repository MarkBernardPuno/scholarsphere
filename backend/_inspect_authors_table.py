import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
dsn = os.getenv('DATABASE_URL', 'postgresql://postgres:admin123@localhost:5432/ScholarSphere')
conn = psycopg2.connect(dsn)
cur = conn.cursor()
cur.execute("""
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='authors'
ORDER BY ordinal_position
""")
rows = cur.fetchall()
print('columns:', rows)
cur.execute("SELECT * FROM authors ORDER BY 1 LIMIT 5")
print('sample rows:', cur.fetchall())
conn.close()
