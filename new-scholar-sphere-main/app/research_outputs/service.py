from fastapi import HTTPException
from psycopg2 import Error

from app.db_errors import raise_db_http_error
from database.database import fetch_all, fetch_one


def create_research_output(db, payload):
    paper = fetch_one(db, "SELECT id FROM research_papers WHERE id = %s", (payload.paper_id,))
    if not paper:
        raise HTTPException(status_code=400, detail="Paper not found")

    if payload.doi:
        existing = fetch_one(db, "SELECT id FROM publications WHERE doi = %s", (payload.doi,))
        if existing:
            raise HTTPException(status_code=400, detail="DOI already exists")

    try:
        row = fetch_one(
            db,
            """
            INSERT INTO publications (
                paper_id, doi, manuscript_link, journal_publisher, volume, issue_number,
                page_number, publication_date, indexing, cite_score, impact_factor,
                editorial_board, journal_website, apa_format
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, paper_id, doi, manuscript_link, journal_publisher, volume,
                      issue_number, page_number, publication_date, indexing, cite_score,
                      impact_factor, editorial_board, journal_website, apa_format,
                      created_at, updated_at
            """,
            (
                payload.paper_id,
                payload.doi,
                payload.manuscript_link,
                payload.journal_publisher,
                payload.volume,
                payload.issue_number,
                payload.page_number,
                payload.publication_date,
                payload.indexing,
                payload.cite_score,
                payload.impact_factor,
                payload.editorial_board,
                payload.journal_website,
                payload.apa_format,
            ),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Publication already exists for this paper or DOI")


def list_research_outputs(db, paper_id: int | None, doi: str | None, search: str | None, skip: int, limit: int):
    query = """
        SELECT id, paper_id, doi, manuscript_link, journal_publisher, volume,
               issue_number, page_number, publication_date, indexing, cite_score,
               impact_factor, editorial_board, journal_website, apa_format,
               created_at, updated_at
        FROM publications
        WHERE (%s IS NULL OR paper_id = %s)
          AND (%s IS NULL OR doi = %s)
          AND (%s IS NULL OR apa_format ILIKE %s OR journal_publisher ILIKE %s)
        ORDER BY created_at DESC
        OFFSET %s LIMIT %s
    """
    params = (
        paper_id,
        paper_id,
        doi,
        doi,
        search,
        f"%{search}%" if search else None,
        f"%{search}%" if search else None,
        skip,
        limit,
    )
    return fetch_all(db, query, params)


def get_research_output(db, publication_id: int):
    row = fetch_one(
        db,
        """
        SELECT id, paper_id, doi, manuscript_link, journal_publisher, volume,
               issue_number, page_number, publication_date, indexing, cite_score,
               impact_factor, editorial_board, journal_website, apa_format,
               created_at, updated_at
        FROM publications
        WHERE id = %s
        """,
        (publication_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Research output not found")
    return row


def update_research_output(db, publication_id: int, payload):
    current = get_research_output(db, publication_id)
    data = payload.model_dump(exclude_unset=True)

    next_paper_id = data.get("paper_id") if data.get("paper_id") else current["paper_id"]
    next_doi = data.get("doi", current["doi"])

    if next_doi and next_doi != current["doi"]:
        existing = fetch_one(db, "SELECT id FROM publications WHERE doi = %s AND id <> %s", (next_doi, publication_id))
        if existing:
            raise HTTPException(status_code=400, detail="DOI already exists")

    try:
        row = fetch_one(
            db,
            """
            UPDATE publications
            SET paper_id = %s,
                doi = %s,
                manuscript_link = %s,
                journal_publisher = %s,
                volume = %s,
                issue_number = %s,
                page_number = %s,
                publication_date = %s,
                indexing = %s,
                cite_score = %s,
                impact_factor = %s,
                editorial_board = %s,
                journal_website = %s,
                apa_format = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, paper_id, doi, manuscript_link, journal_publisher, volume,
                      issue_number, page_number, publication_date, indexing, cite_score,
                      impact_factor, editorial_board, journal_website, apa_format,
                      created_at, updated_at
            """,
            (
                next_paper_id,
                next_doi,
                data.get("manuscript_link", current["manuscript_link"]),
                data.get("journal_publisher", current["journal_publisher"]),
                data.get("volume", current["volume"]),
                data.get("issue_number", current["issue_number"]),
                data.get("page_number", current["page_number"]),
                data.get("publication_date", current["publication_date"]),
                data.get("indexing", current["indexing"]),
                data.get("cite_score", current["cite_score"]),
                data.get("impact_factor", current["impact_factor"]),
                data.get("editorial_board", current["editorial_board"]),
                data.get("journal_website", current["journal_website"]),
                data.get("apa_format", current["apa_format"]),
                publication_id,
            ),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Publication already exists for this paper or DOI")


def delete_research_output(db, publication_id: int):
    try:
        deleted = fetch_one(db, "DELETE FROM publications WHERE id = %s RETURNING id", (publication_id,))
        if not deleted:
            raise HTTPException(status_code=404, detail="Research output not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)
