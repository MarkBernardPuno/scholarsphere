from fastapi import HTTPException
from psycopg2 import Error

from app.authors_api.service import ensure_authors_exist
from app.db_errors import raise_db_http_error
from database.database import fetch_all, fetch_one


def _safe_int(value):
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _resolve_user_id(db, payload: dict) -> int:
    user_id = _safe_int(payload.get("user_id"))
    if user_id:
        return user_id

    fallback = fetch_one(db, "SELECT user_id FROM users ORDER BY user_id ASC LIMIT 1")
    if fallback and fallback.get("user_id"):
        return int(fallback["user_id"])

    raise HTTPException(status_code=400, detail="No user_id provided and no users found in database")


def _resolve_output_type_name(db, output_type_id: int | None, output_type_name: str | None) -> str:
    if output_type_name:
        return output_type_name.strip().lower()

    if output_type_id is None:
        return ""

    row = fetch_one(
        db,
        "SELECT output_type_name FROM research_output_types WHERE output_type_id = %s",
        (output_type_id,),
    )
    return str(row.get("output_type_name") if row else "").strip().lower()


def create_repository_submission(db, payload: dict):
    try:
        user_id = _resolve_user_id(db, payload)
        research_type_id = _safe_int(payload.get("research_type_id"))
        output_type_id = _safe_int(payload.get("research_output_type_id"))
        department_id = _safe_int(payload.get("department_id"))
        school_year_id = _safe_int(payload.get("school_year_id"))
        school_semester_id = _safe_int(payload.get("semester_id"))

        if not payload.get("title"):
            raise HTTPException(status_code=400, detail="title is required")

        authors_text = (payload.get("authors") or "").strip()
        if not authors_text:
            raise HTTPException(status_code=400, detail="authors is required")

        repo = fetch_one(
            db,
            """
            INSERT INTO research_repository (
                user_id,
                title,
                authors,
                research_type_id,
                output_type_id,
                department_id,
                school_year_id,
                school_semester_id,
                status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING research_repository_id, user_id, title, research_type_id, output_type_id,
                      department_id, school_year_id, school_semester_id, status, authors, created_at
            """,
            (
                user_id,
                payload.get("title"),
                authors_text,
                research_type_id,
                output_type_id,
                department_id,
                school_year_id,
                school_semester_id,
                payload.get("status") or "Pending",
            ),
        )

        repo_id = int(repo["research_repository_id"])

        ensure_authors_exist(db, authors_text)

        output_type_name = _resolve_output_type_name(
            db,
            output_type_id,
            payload.get("output_type"),
        )

        if "presentation" in output_type_name:
            fetch_one(
                db,
                """
                INSERT INTO research_repository_presentation (
                    presentation_id, conference_name, presentation_date, venue
                )
                VALUES (%s, %s, %s, %s)
                RETURNING presentation_id
                """,
                (
                    repo_id,
                    payload.get("conference_name"),
                    payload.get("presentation_date") or None,
                    payload.get("presentation_venue"),
                ),
            )
        elif "publication" in output_type_name:
            volume = (payload.get("volume") or "").strip()
            issue = (payload.get("issue_number") or "").strip()
            volume_issue = f"{volume}/{issue}".strip("/") if (volume or issue) else None
            fetch_one(
                db,
                """
                INSERT INTO research_repository_publication (
                    publication_id, journal_name, issn_isbn, volume_issue, doi_link
                )
                VALUES (%s, %s, %s, %s, %s)
                RETURNING publication_id
                """,
                (
                    repo_id,
                    payload.get("journal_publisher"),
                    payload.get("issue_number"),
                    volume_issue,
                    payload.get("manuscript_link") or payload.get("doi"),
                ),
            )

        db.commit()

        return {
            "research_repository_id": repo_id,
            "title": repo.get("title"),
            "status": repo.get("status"),
            "output_type": payload.get("output_type") or output_type_name,
            "authors": repo.get("authors"),
            "created_at": repo.get("created_at"),
        }
    except Error as exc:
        raise_db_http_error(db, exc)


def list_repository_submissions(db, skip: int, limit: int, search: str | None = None, output_type: str | None = None):
    search_term = f"%{search.strip()}%" if search else None
    output_type_term = output_type.strip().lower() if output_type else None
    rows = fetch_all(
        db,
        """
        SELECT
            rr.research_repository_id AS paper_id,
            rr.title AS research_title,
            rr.authors AS authors_id,
            COALESCE(c.college_name, '') AS college_id,
            COALESCE(d.department_name, '') AS program_department_id,
            COALESCE(ot.output_type_name, '') AS research_output_type_id,
            COALESCE(rt.research_type_name, '') AS research_type_id,
            COALESCE(sy.year_label, '') AS school_year_id,
            COALESCE(ss.semester_label, '') AS semester_id,
            COALESCE(rp.venue, '') AS presentation_venue,
            COALESCE(rp.conference_name, '') AS conference_name,
            COALESCE(pub.doi_link, '') AS doi,
            COALESCE(pub.doi_link, '') AS manuscript_link,
            COALESCE(pub.journal_name, '') AS journal_publisher,
            rr.status,
            rr.created_at
        FROM research_repository rr
        LEFT JOIN departments d ON d.department_id = rr.department_id
        LEFT JOIN colleges c ON c.college_id = d.college_id
        LEFT JOIN research_output_types ot ON ot.output_type_id = rr.output_type_id
        LEFT JOIN research_types rt ON rt.research_type_id = rr.research_type_id
        LEFT JOIN school_years sy ON sy.school_year_id = rr.school_year_id
        LEFT JOIN school_semesters ss ON ss.school_semester_id = rr.school_semester_id
        LEFT JOIN research_repository_presentation rp ON rp.presentation_id = rr.research_repository_id
        LEFT JOIN research_repository_publication pub ON pub.publication_id = rr.research_repository_id
        WHERE (
            %s IS NULL
            OR rr.title ILIKE %s
            OR rr.authors ILIKE %s
            OR COALESCE(c.college_name, '') ILIKE %s
        )
          AND (
            %s IS NULL
            OR LOWER(COALESCE(ot.output_type_name, '')) = %s
          )
        ORDER BY rr.created_at DESC, rr.research_repository_id DESC
        OFFSET %s LIMIT %s
        """,
        (
            search,
            search_term,
            search_term,
            search_term,
            output_type,
            output_type_term,
            skip,
            limit,
        ),
    )
    return rows


def delete_repository_submission(db, repository_id: int):
    try:
        deleted = fetch_one(
            db,
            "DELETE FROM research_repository WHERE research_repository_id = %s RETURNING research_repository_id",
            (repository_id,),
        )
        if not deleted:
            raise HTTPException(status_code=404, detail="Repository record not found")
        db.commit()
        return None
    except Error as exc:
        raise_db_http_error(db, exc)
