from fastapi import HTTPException
from psycopg2 import Error

from app.db_errors import raise_db_http_error
from database.database import fetch_all, fetch_one


def create_research_type(db, name: str, description: str | None):
    try:
        row = fetch_one(
            db,
            "INSERT INTO research_types (name, description) VALUES (%s, %s) RETURNING id, name, description",
            (name, description),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def list_research_types(db):
    return fetch_all(db, "SELECT id, name, description FROM research_types ORDER BY name")


def create_research_output_type(db, name: str, description: str | None):
    try:
        row = fetch_one(
            db,
            "INSERT INTO research_output_types (name, description) VALUES (%s, %s) RETURNING id, name, description",
            (name, description),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def list_research_output_types(db):
    return fetch_all(db, "SELECT id, name, description FROM research_output_types ORDER BY name")


def create_author(db, payload):
    try:
        row = fetch_one(
            db,
            """
            INSERT INTO authors (user_id, department_id, first_name, middle_name, last_name)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, user_id, department_id, first_name, middle_name, last_name, created_at
            """,
            (
                payload.user_id,
                payload.department_id,
                payload.first_name,
                payload.middle_name,
                payload.last_name,
            ),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def list_authors(db, skip: int, limit: int):
    return fetch_all(
        db,
        """
        SELECT id, user_id, department_id, first_name, middle_name, last_name, created_at
        FROM authors
        ORDER BY created_at DESC
        OFFSET %s LIMIT %s
        """,
        (skip, limit),
    )


def _get_author_ids_for_paper(db, paper_id: int) -> list[int]:
    rows = fetch_all(
        db,
        "SELECT author_id FROM research_authors WHERE paper_id = %s ORDER BY author_order NULLS LAST",
        (paper_id,),
    )
    return [row["author_id"] for row in rows]


def _replace_paper_authors(db, paper_id: int, authors):
    fetch_one(db, "DELETE FROM research_authors WHERE paper_id = %s RETURNING paper_id", (paper_id,))
    for author in authors:
        if isinstance(author, dict):
            author_id = author.get("author_id")
            is_primary = author.get("is_primary_author", False)
            author_order = author.get("author_order")
        else:
            author_id = author.author_id
            is_primary = author.is_primary_author
            author_order = author.author_order

        fetch_one(
            db,
            """
            INSERT INTO research_authors (paper_id, author_id, is_primary_author, author_order)
            VALUES (%s, %s, %s, %s)
            RETURNING paper_id
            """,
            (paper_id, author_id, is_primary, author_order),
        )


def create_paper(db, payload):
    try:
        paper = fetch_one(
            db,
            """
            INSERT INTO research_papers (
                research_type_id, research_output_type_id, school_year_id, semester_id,
                title, abstract, keywords, is_active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, research_type_id, research_output_type_id, school_year_id, semester_id,
                      title, abstract, keywords, is_active, created_at, updated_at
            """,
            (
                payload.research_type_id,
                payload.research_output_type_id,
                payload.school_year_id,
                payload.semester_id,
                payload.title,
                payload.abstract,
                payload.keywords,
                payload.is_active,
            ),
        )

        if payload.authors:
            _replace_paper_authors(db, paper["id"], payload.authors)

        db.commit()
        paper["author_ids"] = _get_author_ids_for_paper(db, paper["id"])
        return paper
    except Error as exc:
        raise_db_http_error(db, exc)


def list_papers(db, q: str | None, skip: int, limit: int):
    if q:
        papers = fetch_all(
            db,
            """
            SELECT id, research_type_id, research_output_type_id, school_year_id, semester_id,
                   title, abstract, keywords, is_active, created_at, updated_at
            FROM research_papers
            WHERE title ILIKE %s
            ORDER BY created_at DESC
            OFFSET %s LIMIT %s
            """,
            (f"%{q}%", skip, limit),
        )
    else:
        papers = fetch_all(
            db,
            """
            SELECT id, research_type_id, research_output_type_id, school_year_id, semester_id,
                   title, abstract, keywords, is_active, created_at, updated_at
            FROM research_papers
            ORDER BY created_at DESC
            OFFSET %s LIMIT %s
            """,
            (skip, limit),
        )

    for paper in papers:
        paper["author_ids"] = _get_author_ids_for_paper(db, paper["id"])
    return papers


def get_paper(db, paper_id: int):
    paper = fetch_one(
        db,
        """
        SELECT id, research_type_id, research_output_type_id, school_year_id, semester_id,
               title, abstract, keywords, is_active, created_at, updated_at
        FROM research_papers
        WHERE id = %s
        """,
        (paper_id,),
    )
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    paper["author_ids"] = _get_author_ids_for_paper(db, paper_id)
    return paper


def update_paper(db, paper_id: int, payload):
    current = get_paper(db, paper_id)
    update_data = payload.model_dump(exclude_unset=True)

    final_data = {
        "research_type_id": update_data.get("research_type_id") if update_data.get("research_type_id") else current["research_type_id"],
        "research_output_type_id": update_data.get("research_output_type_id") if update_data.get("research_output_type_id") else current["research_output_type_id"],
        "school_year_id": update_data.get("school_year_id") if update_data.get("school_year_id") else current["school_year_id"],
        "semester_id": update_data.get("semester_id") if update_data.get("semester_id") else current["semester_id"],
        "title": update_data.get("title", current["title"]),
        "abstract": update_data.get("abstract", current["abstract"]),
        "keywords": update_data.get("keywords", current["keywords"]),
        "is_active": update_data.get("is_active", current["is_active"]),
    }

    try:
        paper = fetch_one(
            db,
            """
            UPDATE research_papers
            SET research_type_id = %s,
                research_output_type_id = %s,
                school_year_id = %s,
                semester_id = %s,
                title = %s,
                abstract = %s,
                keywords = %s,
                is_active = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, research_type_id, research_output_type_id, school_year_id, semester_id,
                      title, abstract, keywords, is_active, created_at, updated_at
            """,
            (
                final_data["research_type_id"],
                final_data["research_output_type_id"],
                final_data["school_year_id"],
                final_data["semester_id"],
                final_data["title"],
                final_data["abstract"],
                final_data["keywords"],
                final_data["is_active"],
                paper_id,
            ),
        )

        if "authors" in update_data:
            _replace_paper_authors(db, paper_id, update_data["authors"] or [])

        db.commit()
        paper["author_ids"] = _get_author_ids_for_paper(db, paper_id)
        return paper
    except Error as exc:
        raise_db_http_error(db, exc)


def delete_paper(db, paper_id: int):
    deleted = fetch_one(
        db,
        "SELECT id FROM research_papers WHERE id = %s",
        (paper_id,),
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Paper not found")

    try:
        fetch_one(db, "DELETE FROM research_papers WHERE id = %s RETURNING id", (paper_id,))
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)
