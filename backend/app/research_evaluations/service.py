import json
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from psycopg2 import Error

from app.authors_api.service import ensure_authors_exist
from app.db_errors import raise_db_http_error
from database.database import fetch_all, fetch_one


UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads" / "evaluation_files"


def _safe_int(value):
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _decode_remarks(remarks):
    if not remarks:
        return {}
    try:
        parsed = json.loads(remarks)
        if isinstance(parsed, dict):
            return parsed
        return {"notes": str(parsed)}
    except (TypeError, ValueError):
        return {"notes": remarks}


def _encode_remarks(campus_id, college_id, department_id, notes=None):
    payload = {
        "campus_id": campus_id or "",
        "college_id": college_id or "",
        "department_id": department_id or "",
        "notes": notes or "",
    }
    return json.dumps(payload)


def _list_status_values(db) -> list[str]:
    rows = fetch_all(
        db,
        "SELECT status_name FROM status ORDER BY status_name ASC, status_id ASC",
        (),
    )
    return [str(row["status_name"]) for row in rows]


def _list_statuses_and_remarks_values(db) -> list[str]:
    rows = fetch_all(
        db,
        """
        SELECT statuses_and_remarks_name
        FROM statuses_and_remarks
        ORDER BY statuses_and_remarks_name ASC, statuses_and_remarks_id ASC
        """,
        (),
    )
    return [str(row["statuses_and_remarks_name"]) for row in rows]


def _normalize_status(db, status_value: str | None) -> str | None:
    if status_value in (None, ""):
        return None
    candidate = str(status_value).strip()
    row = fetch_one(
        db,
        "SELECT status_name FROM status WHERE lower(status_name) = lower(%s)",
        (candidate,),
    )
    if not row:
        allowed = _list_status_values(db)
        raise HTTPException(status_code=422, detail=f"status must be one of: {allowed}")
    return str(row["status_name"])


def _normalize_statuses_and_remarks(db, remarks_value: str | None) -> str | None:
    if remarks_value in (None, ""):
        return None
    candidate = str(remarks_value).strip()
    row = fetch_one(
        db,
        """
        SELECT statuses_and_remarks_name
        FROM statuses_and_remarks
        WHERE lower(statuses_and_remarks_name) = lower(%s)
        """,
        (candidate,),
    )
    if not row:
        allowed = _list_statuses_and_remarks_values(db)
        raise HTTPException(
            status_code=422,
            detail=f"statuses_and_remarks must be one of: {allowed}",
        )
    return str(row["statuses_and_remarks_name"])


def update_research_evaluation_status(db, evaluation_id: int, status_value: str | None):
    normalized_status = _normalize_status(db, status_value)
    if normalized_status is None:
        allowed = _list_status_values(db)
        raise HTTPException(status_code=422, detail=f"status must be one of: {allowed}")

    try:
        row = fetch_one(
            db,
            """
            UPDATE research_evaluations
            SET status = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE evaluation_id = %s
            RETURNING evaluation_id, user_id, research_title, authors, school_year_id, semester,
                      appointment_date, appointment_time, status, remarks, created_at, updated_at
            """,
            (normalized_status, evaluation_id),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Research evaluation not found")

        db.commit()
        file_map = _fetch_file_map(db, [evaluation_id])
        return _to_frontend(row, file_map.get(evaluation_id, {}))
    except Error as exc:
        raise_db_http_error(db, exc)


def _store_file(file: UploadFile) -> tuple[str, str]:
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    original_name = file.filename or "upload.bin"
    suffix = Path(original_name).suffix
    stored_name = f"{uuid4().hex}{suffix}"
    destination = UPLOAD_ROOT / stored_name
    data = file.file.read()
    destination.write_bytes(data)
    return f"/research-evaluations/files/{stored_name}", original_name


def _upsert_file_records(db, evaluation_id: int, files: dict[str, UploadFile]):
    for category, upload in files.items():
        if not upload or not upload.filename:
            continue
        file_path, file_name = _store_file(upload)
        fetch_one(
            db,
            "DELETE FROM evaluation_files WHERE evaluation_id = %s AND file_category = %s RETURNING file_id",
            (evaluation_id, category),
        )
        fetch_one(
            db,
            """
            INSERT INTO evaluation_files (evaluation_id, file_category, file_path, file_name)
            VALUES (%s, %s, %s, %s)
            RETURNING file_id
            """,
            (evaluation_id, category, file_path, file_name),
        )


def _verification_flags_from_files(files: dict[str, UploadFile]) -> dict[str, bool]:
    def has(category: str) -> bool:
        upload = files.get(category)
        return bool(upload and upload.filename)

    return {
        "is_authorship_verified": has("authorship_form"),
        "is_evaluation_form_verified": has("evaluation_form"),
        "is_full_paper_verified": has("full_paper"),
        "is_turnitin_verified": has("turnitin_report"),
        "is_grammarly_verified": has("grammarly_report"),
        "is_journal_info_verified": has("journal_conference_info"),
    }


def _verification_flags_from_file_map(file_map: dict) -> dict[str, bool]:
    return {
        "is_authorship_verified": bool(file_map.get("authorship_form")),
        "is_evaluation_form_verified": bool(file_map.get("evaluation_form")),
        "is_full_paper_verified": bool(file_map.get("full_paper")),
        "is_turnitin_verified": bool(file_map.get("turnitin_report")),
        "is_grammarly_verified": bool(file_map.get("grammarly_report")),
        "is_journal_info_verified": bool(file_map.get("journal_conference_info")),
    }


def _fetch_file_map(db, evaluation_ids: list[int]) -> dict[int, dict]:
    if not evaluation_ids:
        return {}
    rows = fetch_all(
        db,
        """
        SELECT evaluation_id, file_category, file_path, file_name
        FROM evaluation_files
        WHERE evaluation_id = ANY(%s)
        ORDER BY uploaded_at DESC
        """,
        (evaluation_ids,),
    )
    mapping: dict[int, dict] = {}
    for row in rows:
        evaluation_id = int(row["evaluation_id"])
        entry = mapping.setdefault(evaluation_id, {})
        category = row["file_category"]
        if category not in entry:
            entry[category] = {"path": row["file_path"], "name": row["file_name"]}
    return mapping


def _to_frontend(row: dict, file_map: dict) -> dict:
    remarks_meta = _decode_remarks(row.get("remarks"))
    return {
        "re_id": row["evaluation_id"],
        "evaluation_id": row["evaluation_id"],
        "title_of_research": row.get("research_title") or "",
        "author_id": row.get("authors") or "",
        "campus_id": remarks_meta.get("campus_id", ""),
        "college_id": remarks_meta.get("college_id", ""),
        "department_id": remarks_meta.get("department_id", ""),
        "school_year_id": str(row.get("school_year_id") or ""),
        "semester_id": row.get("semester") or "",
        "status": row.get("status") or "Submitted",
        "tracking_status": row.get("status") or "Submitted",
        "appointment_date": row.get("appointment_date"),
        "appointment_time": row.get("appointment_time"),
        "remarks": remarks_meta.get("notes", ""),
        "authorship_form": file_map.get("authorship_form", {}).get("path"),
        "authorship_form_name": file_map.get("authorship_form", {}).get("name"),
        "evaluation_form": file_map.get("evaluation_form", {}).get("path"),
        "evaluation_form_name": file_map.get("evaluation_form", {}).get("name"),
        "full_paper": file_map.get("full_paper", {}).get("path"),
        "full_paper_name": file_map.get("full_paper", {}).get("name"),
        "turnitin_report": file_map.get("turnitin_report", {}).get("path"),
        "turnitin_report_name": file_map.get("turnitin_report", {}).get("name"),
        "grammarly_report": file_map.get("grammarly_report", {}).get("path"),
        "grammarly_report_name": file_map.get("grammarly_report", {}).get("name"),
        "journal_conference_info": file_map.get("journal_conference_info", {}).get("path"),
        "journal_conference_info_name": file_map.get("journal_conference_info", {}).get("name"),
        "certificate_of_presentation": file_map.get("certificate_of_presentation", {}).get("path"),
        "certificate_of_presentation_name": file_map.get("certificate_of_presentation", {}).get("name"),
        "call_for_paper": file_map.get("call_for_paper", {}).get("path"),
        "call_for_paper_name": file_map.get("call_for_paper", {}).get("name"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
    }


def create_research_evaluation_from_form(db, payload: dict, files: dict[str, UploadFile]):
    try:
        ensure_authors_exist(db, payload.get("author_id"))
        verify = _verification_flags_from_files(files)
        row = fetch_one(
            db,
            """
            INSERT INTO research_evaluations (
                user_id,
                research_title,
                authors,
                school_year_id,
                semester,
                appointment_date,
                appointment_time,
                status,
                remarks,
                is_authorship_verified,
                is_evaluation_form_verified,
                is_full_paper_verified,
                is_turnitin_verified,
                is_grammarly_verified,
                is_journal_info_verified
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING evaluation_id, user_id, research_title, authors, school_year_id, semester,
                      appointment_date, appointment_time, status, remarks, created_at, updated_at
            """,
            (
                _safe_int(payload.get("user_id")),
                payload.get("title_of_research"),
                payload.get("author_id"),
                _safe_int(payload.get("school_year_id")),
                str(payload.get("semester_id") or ""),
                payload.get("appointment_date"),
                payload.get("appointment_time"),
                "Submitted",
                _encode_remarks(
                    payload.get("campus_id"),
                    payload.get("college_id"),
                    payload.get("department_id"),
                    payload.get("remarks"),
                ),
                verify["is_authorship_verified"],
                verify["is_evaluation_form_verified"],
                verify["is_full_paper_verified"],
                verify["is_turnitin_verified"],
                verify["is_grammarly_verified"],
                verify["is_journal_info_verified"],
            ),
        )

        _upsert_file_records(db, int(row["evaluation_id"]), files)
        db.commit()

        file_map = _fetch_file_map(db, [int(row["evaluation_id"])])
        return _to_frontend(row, file_map.get(int(row["evaluation_id"]), {}))
    except Error as exc:
        raise_db_http_error(db, exc)


def list_research_evaluations(db, paper_id: int | None, status_value: str | None, search: str | None, skip: int, limit: int):
    del paper_id  # kept for backward-compatible route signature
    query = """
        SELECT evaluation_id, user_id, research_title, authors, school_year_id, semester,
               appointment_date, appointment_time, status, remarks, created_at, updated_at
        FROM research_evaluations
        WHERE (%s IS NULL OR status = %s)
          AND (
              %s IS NULL
              OR research_title ILIKE %s
              OR authors ILIKE %s
          )
        ORDER BY created_at DESC
        OFFSET %s LIMIT %s
    """
    search_pattern = f"%{search}%" if search else None
    rows = fetch_all(
        db,
        query,
        (status_value, status_value, search, search_pattern, search_pattern, skip, limit),
    )
    ids = [int(row["evaluation_id"]) for row in rows]
    files = _fetch_file_map(db, ids)
    return [_to_frontend(row, files.get(int(row["evaluation_id"]), {})) for row in rows]


def list_tracking_dropdowns(db) -> dict[str, list[dict]]:
    status_rows = fetch_all(
        db,
        """
        SELECT status_id, status_name
        FROM status
        ORDER BY status_name ASC, status_id ASC
        """,
        (),
    )
    statuses_and_remarks_rows = fetch_all(
        db,
        """
        SELECT statuses_and_remarks_id, statuses_and_remarks_name
        FROM statuses_and_remarks
        ORDER BY statuses_and_remarks_name ASC, statuses_and_remarks_id ASC
        """,
        (),
    )

    return {
        "status": [
            {"id": row["status_id"], "name": row["status_name"]}
            for row in status_rows
        ],
        "statuses_and_remarks": [
            {
                "id": row["statuses_and_remarks_id"],
                "name": row["statuses_and_remarks_name"],
            }
            for row in statuses_and_remarks_rows
        ],
    }


def get_research_evaluation(db, evaluation_id: int):
    row = fetch_one(
        db,
        """
        SELECT evaluation_id, user_id, research_title, authors, school_year_id, semester,
               appointment_date, appointment_time, status, remarks, created_at, updated_at
        FROM research_evaluations
        WHERE evaluation_id = %s
        """,
        (evaluation_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Research evaluation not found")
    file_map = _fetch_file_map(db, [evaluation_id])
    return _to_frontend(row, file_map.get(evaluation_id, {}))


def update_research_evaluation_from_form(db, evaluation_id: int, payload: dict, files: dict[str, UploadFile]):
    current = fetch_one(
        db,
        """
        SELECT evaluation_id, user_id, research_title, authors, school_year_id, semester,
               appointment_date, appointment_time, status, remarks, created_at, updated_at
        FROM research_evaluations
        WHERE evaluation_id = %s
        """,
        (evaluation_id,),
    )
    if not current:
        raise HTTPException(status_code=404, detail="Research evaluation not found")

    meta = _decode_remarks(current.get("remarks"))
    next_campus = payload.get("campus_id") if payload.get("campus_id") not in (None, "") else meta.get("campus_id", "")
    next_college = payload.get("college_id") if payload.get("college_id") not in (None, "") else meta.get("college_id", "")
    next_department = payload.get("department_id") if payload.get("department_id") not in (None, "") else meta.get("department_id", "")
    normalized_status = _normalize_status(db, payload.get("status"))
    normalized_dropdown_remark = _normalize_statuses_and_remarks(
        db,
        payload.get("statuses_and_remarks_name") or payload.get("statuses_and_remarks") or payload.get("remarks_option"),
    )
    raw_remarks = payload.get("remarks")
    if raw_remarks not in (None, ""):
        next_notes = raw_remarks
    elif normalized_dropdown_remark is not None:
        next_notes = normalized_dropdown_remark
    else:
        next_notes = meta.get("notes", "")

    try:
        row = fetch_one(
            db,
            """
            UPDATE research_evaluations
            SET research_title = %s,
                authors = %s,
                school_year_id = %s,
                semester = %s,
                appointment_date = COALESCE(%s, appointment_date),
                appointment_time = COALESCE(%s, appointment_time),
                status = COALESCE(%s, status),
                remarks = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE evaluation_id = %s
            RETURNING evaluation_id, user_id, research_title, authors, school_year_id, semester,
                      appointment_date, appointment_time, status, remarks, created_at, updated_at
            """,
            (
                payload.get("title_of_research") or current.get("research_title"),
                payload.get("author_id") or current.get("authors"),
                _safe_int(payload.get("school_year_id")) or current.get("school_year_id"),
                str(payload.get("semester_id") or current.get("semester") or ""),
                payload.get("appointment_date"),
                payload.get("appointment_time"),
                normalized_status,
                _encode_remarks(next_campus, next_college, next_department, next_notes),
                evaluation_id,
            ),
        )

        _upsert_file_records(db, evaluation_id, files)

        latest_files = _fetch_file_map(db, [evaluation_id]).get(evaluation_id, {})
        verify = _verification_flags_from_file_map(latest_files)
        fetch_one(
            db,
            """
            UPDATE research_evaluations
            SET is_authorship_verified = %s,
                is_evaluation_form_verified = %s,
                is_full_paper_verified = %s,
                is_turnitin_verified = %s,
                is_grammarly_verified = %s,
                is_journal_info_verified = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE evaluation_id = %s
            RETURNING evaluation_id
            """,
            (
                verify["is_authorship_verified"],
                verify["is_evaluation_form_verified"],
                verify["is_full_paper_verified"],
                verify["is_turnitin_verified"],
                verify["is_grammarly_verified"],
                verify["is_journal_info_verified"],
                evaluation_id,
            ),
        )

        db.commit()

        file_map = _fetch_file_map(db, [evaluation_id])
        return _to_frontend(row, file_map.get(evaluation_id, {}))
    except Error as exc:
        raise_db_http_error(db, exc)


def delete_research_evaluation(db, evaluation_id: int):
    try:
        fetch_one(db, "DELETE FROM evaluation_files WHERE evaluation_id = %s RETURNING file_id", (evaluation_id,))
        deleted = fetch_one(
            db,
            "DELETE FROM research_evaluations WHERE evaluation_id = %s RETURNING evaluation_id",
            (evaluation_id,),
        )
        if not deleted:
            raise HTTPException(status_code=404, detail="Research evaluation not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)
