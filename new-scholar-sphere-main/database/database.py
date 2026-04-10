import os
from pathlib import Path

from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:admin123@localhost:5432/NewScholarSphere",
)

_pool: SimpleConnectionPool | None = None


def get_pool() -> SimpleConnectionPool:
    global _pool
    if _pool is None:
        _pool = SimpleConnectionPool(minconn=1, maxconn=10, dsn=DATABASE_URL)
    return _pool


def get_db():
    pool = get_pool()
    conn = pool.getconn()
    try:
        yield conn
    finally:
        try:
            conn.rollback()
        except Exception:
            pass
        pool.putconn(conn)


def fetch_one(conn, query: str, params: tuple | None = None) -> dict | None:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params)
        return cur.fetchone()


def fetch_all(conn, query: str, params: tuple | None = None) -> list[dict]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params)
        return list(cur.fetchall())


def execute(conn, query: str, params: tuple | None = None) -> int:
    with conn.cursor() as cur:
        cur.execute(query, params)
        return cur.rowcount


def init_schema(schema_file: str = "database/schema.sql") -> None:
    schema_path = Path(schema_file)
    sql = schema_path.read_text(encoding="utf-8")

    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)
