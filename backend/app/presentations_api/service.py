from fastapi import HTTPException
from psycopg2 import Error

from app.db_errors import raise_db_http_error
from database.database import fetch_all, fetch_one


def create_presentation(db, payload):
    paper = fetch_one(db, "SELECT id FROM research_papers WHERE id = %s", (payload.paper_id,))
    if not paper:
        raise HTTPException(status_code=400, detail="Paper not found")

    try:
        row = fetch_one(
            db,
            """
            INSERT INTO presentations (paper_id, venue, conference_name, presentation_date)
            VALUES (%s, %s, %s, %s)
            RETURNING id, paper_id, venue, conference_name, presentation_date, created_at
            """,
            (payload.paper_id, payload.venue, payload.conference_name, payload.presentation_date),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Presentation already exists for this paper")


def list_presentations(db, paper_id: int | None, skip: int, limit: int):
    return fetch_all(
        db,
        """
        SELECT id, paper_id, venue, conference_name, presentation_date, created_at
        FROM presentations
        WHERE (%s IS NULL OR paper_id = %s)
        ORDER BY created_at DESC
        OFFSET %s LIMIT %s
        """,
        (paper_id, paper_id, skip, limit),
    )


def get_presentation(db, presentation_id: int):
    row = fetch_one(
        db,
        """
        SELECT id, paper_id, venue, conference_name, presentation_date, created_at
        FROM presentations
        WHERE id = %s
        """,
        (presentation_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Presentation not found")
    return row


def update_presentation(db, presentation_id: int, payload):
    current = get_presentation(db, presentation_id)
    data = payload.model_dump(exclude_unset=True)

    next_paper_id = data["paper_id"] if data.get("paper_id") else current["paper_id"]
    paper = fetch_one(db, "SELECT id FROM research_papers WHERE id = %s", (next_paper_id,))
    if not paper:
        raise HTTPException(status_code=400, detail="Paper not found")

    try:
        row = fetch_one(
            db,
            """
            UPDATE presentations
            SET paper_id = %s,
                venue = %s,
                conference_name = %s,
                presentation_date = %s
            WHERE id = %s
            RETURNING id, paper_id, venue, conference_name, presentation_date, created_at
            """,
            (
                next_paper_id,
                data.get("venue", current["venue"]),
                data.get("conference_name", current["conference_name"]),
                data.get("presentation_date", current["presentation_date"]),
                presentation_id,
            ),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Presentation already exists for this paper")


def delete_presentation(db, presentation_id: int):
    try:
        row = fetch_one(db, "DELETE FROM presentations WHERE id = %s RETURNING id", (presentation_id,))
        if not row:
            raise HTTPException(status_code=404, detail="Presentation not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)
