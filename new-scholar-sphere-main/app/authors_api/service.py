from fastapi import HTTPException
from psycopg2 import Error

from app.db_errors import raise_db_http_error
from database.database import fetch_all, fetch_one


def _parse_author_names(raw: str | None) -> list[str]:
    if not raw:
        return []
    items = [part.strip() for part in str(raw).split(",")]
    cleaned = [item for item in items if item]
    deduped: list[str] = []
    seen: set[str] = set()
    for name in cleaned:
        key = name.casefold()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(name)
    return deduped


def ensure_authors_exist(db, raw_names: str | None) -> list[dict]:
    names = _parse_author_names(raw_names)
    ensured: list[dict] = []
    for name in names:
        existing = fetch_one(
            db,
            """
            SELECT author_id, author_name
            FROM authors
            WHERE LOWER(author_name) = LOWER(%s)
            LIMIT 1
            """,
            (name,),
        )
        if existing:
            ensured.append(existing)
            continue

        created = fetch_one(
            db,
            """
            INSERT INTO authors (author_name)
            VALUES (%s)
            RETURNING author_id, author_name
            """,
            (name,),
        )
        ensured.append(created)

    return ensured


def create_author(db, payload):
    try:
        normalized_name = payload.author_name.strip()
        existing = fetch_one(
            db,
            """
            SELECT author_id, author_name
            FROM authors
            WHERE LOWER(author_name) = LOWER(%s)
            LIMIT 1
            """,
            (normalized_name,),
        )
        row = existing or fetch_one(
            db,
            """
            INSERT INTO authors (author_name)
            VALUES (%s)
            RETURNING author_id, author_name
            """,
            (normalized_name,),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def list_authors(db, search: str | None, skip: int, limit: int):
    search_pattern = f"%{search.strip()}%" if search else None
    return fetch_all(
        db,
        """
        SELECT author_id, author_name
        FROM authors
        WHERE (%s IS NULL OR author_name ILIKE %s)
        ORDER BY author_name ASC, author_id ASC
        OFFSET %s LIMIT %s
        """,
        (search, search_pattern, skip, limit),
    )


def get_author(db, author_id: int):
    row = fetch_one(
        db,
        "SELECT author_id, author_name FROM authors WHERE author_id = %s",
        (author_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Author not found")
    return row


def update_author(db, author_id: int, payload):
    current = get_author(db, author_id)
    data = payload.model_dump(exclude_unset=True)
    try:
        row = fetch_one(
            db,
            """
            UPDATE authors
            SET author_name = %s
            WHERE author_id = %s
            RETURNING author_id, author_name
            """,
            (data.get("author_name", current["author_name"]).strip(), author_id),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Author already exists")


def delete_author(db, author_id: int):
    try:
        row = fetch_one(
            db,
            "DELETE FROM authors WHERE author_id = %s RETURNING author_id",
            (author_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Author not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)
