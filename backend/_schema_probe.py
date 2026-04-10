import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
dsn = os.getenv("DATABASE_URL", "postgresql://postgres:admin123@localhost:5432/ScholarSphere")
conn = psycopg2.connect(dsn)
cur = conn.cursor()
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'research_evaluations' ORDER BY ordinal_position")
print('research_evaluations:', cur.fetchall())
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'research_papers' ORDER BY ordinal_position")
print('research_papers:', cur.fetchall())
conn.close()
