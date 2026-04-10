from fastapi import HTTPException
from psycopg2 import Error

from app.db_errors import raise_db_http_error
from database.database import fetch_all, fetch_one


# Campuses

def create_campus(db, payload):
    try:
        row = fetch_one(
            db,
            """
            INSERT INTO campuses (campus_name)
            VALUES (%s)
            RETURNING campus_id, campus_name, created_at
            """,
            (payload.campus_name,),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def list_campuses(db, skip: int, limit: int, active_only: bool | None = None):
    return fetch_all(
        db,
        """
        SELECT campus_id, campus_name, created_at
        FROM campuses
        ORDER BY campus_name ASC, campus_id ASC
        OFFSET %s LIMIT %s
        """,
        (skip, limit),
    )


def get_campus(db, campus_id: int):
    row = fetch_one(
        db,
        "SELECT campus_id, campus_name, created_at FROM campuses WHERE campus_id = %s",
        (campus_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Campus not found")
    return row


def update_campus(db, campus_id: int, payload):
    current = get_campus(db, campus_id)
    data = payload.model_dump(exclude_unset=True)

    try:
        row = fetch_one(
            db,
            """
            UPDATE campuses
            SET campus_name = %s
            WHERE campus_id = %s
            RETURNING campus_id, campus_name, created_at
            """,
            (
                data.get("campus_name", current["campus_name"]),
                campus_id,
            ),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def delete_campus(db, campus_id: int):
    try:
        row = fetch_one(db, "DELETE FROM campuses WHERE campus_id = %s RETURNING campus_id", (campus_id,))
        if not row:
            raise HTTPException(status_code=404, detail="Campus not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)


# Colleges

def _assert_campus_exists(db, campus_id: int):
    campus = fetch_one(db, "SELECT campus_id FROM campuses WHERE campus_id = %s", (campus_id,))
    if not campus:
        raise HTTPException(status_code=400, detail="Campus not found")


def create_college(db, payload):
    _assert_campus_exists(db, payload.campus_id)

    try:
        row = fetch_one(
            db,
            """
            INSERT INTO colleges (campus_id, college_name, is_graduate)
            VALUES (%s, %s, %s)
            RETURNING college_id, campus_id, college_name, is_graduate, created_at
            """,
            (payload.campus_id, payload.college_name, payload.is_graduate),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def list_colleges(db, campus_id: int | None, skip: int, limit: int, active_only: bool | None = None):
    return fetch_all(
        db,
        """
        SELECT college_id, campus_id, college_name, is_graduate, created_at
        FROM colleges
        WHERE (%s IS NULL OR campus_id = %s)
        ORDER BY college_name ASC, college_id ASC
        OFFSET %s LIMIT %s
        """,
        (campus_id, campus_id, skip, limit),
    )


def get_college(db, college_id: int):
    row = fetch_one(
        db,
        "SELECT college_id, campus_id, college_name, is_graduate, created_at FROM colleges WHERE college_id = %s",
        (college_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="College not found")
    return row


def update_college(db, college_id: int, payload):
    current = get_college(db, college_id)
    data = payload.model_dump(exclude_unset=True)

    next_campus_id = data.get("campus_id", current["campus_id"])
    _assert_campus_exists(db, next_campus_id)

    try:
        row = fetch_one(
            db,
            """
            UPDATE colleges
            SET campus_id = %s,
                college_name = %s,
                is_graduate = %s
            WHERE college_id = %s
            RETURNING college_id, campus_id, college_name, is_graduate, created_at
            """,
            (
                next_campus_id,
                data.get("college_name", current["college_name"]),
                data.get("is_graduate", current["is_graduate"]),
                college_id,
            ),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def delete_college(db, college_id: int):
    try:
        row = fetch_one(db, "DELETE FROM colleges WHERE college_id = %s RETURNING college_id", (college_id,))
        if not row:
            raise HTTPException(status_code=404, detail="College not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)


# Departments

def _assert_college_exists(db, college_id: int):
    college = fetch_one(db, "SELECT college_id FROM colleges WHERE college_id = %s", (college_id,))
    if not college:
        raise HTTPException(status_code=400, detail="College not found")


def create_department(db, payload):
    _assert_college_exists(db, payload.college_id)

    try:
        row = fetch_one(
            db,
            """
            INSERT INTO departments (college_id, department_name)
            VALUES (%s, %s)
            RETURNING department_id, college_id, department_name, created_at
            """,
            (payload.college_id, payload.department_name),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def list_departments(db, college_id: int | None, skip: int, limit: int, active_only: bool | None = None):
    return fetch_all(
        db,
        """
        SELECT department_id, college_id, department_name, created_at
        FROM departments
        WHERE (%s IS NULL OR college_id = %s)
        ORDER BY department_name ASC, department_id ASC
        OFFSET %s LIMIT %s
        """,
        (college_id, college_id, skip, limit),
    )


def get_department(db, department_id: int):
    row = fetch_one(
        db,
        "SELECT department_id, college_id, department_name, created_at FROM departments WHERE department_id = %s",
        (department_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Department not found")
    return row


def update_department(db, department_id: int, payload):
    current = get_department(db, department_id)
    data = payload.model_dump(exclude_unset=True)

    next_college_id = data.get("college_id", current["college_id"])
    _assert_college_exists(db, next_college_id)

    try:
        row = fetch_one(
            db,
            """
            UPDATE departments
            SET college_id = %s,
                department_name = %s
            WHERE department_id = %s
            RETURNING department_id, college_id, department_name, created_at
            """,
            (
                next_college_id,
                data.get("department_name", current["department_name"]),
                department_id,
            ),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def delete_department(db, department_id: int):
    try:
        row = fetch_one(db, "DELETE FROM departments WHERE department_id = %s RETURNING department_id", (department_id,))
        if not row:
            raise HTTPException(status_code=404, detail="Department not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)


# School years

def create_school_year(db, payload):
    try:
        row = fetch_one(
            db,
            """
            INSERT INTO school_years (year_label)
            VALUES (%s)
            RETURNING school_year_id, year_label
            """,
            (payload.year_label,),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="School year already exists")


def list_school_years(db, skip: int, limit: int):
    return fetch_all(
        db,
        """
        SELECT school_year_id, year_label
        FROM school_years
        ORDER BY year_label DESC
        OFFSET %s LIMIT %s
        """,
        (skip, limit),
    )


def get_school_year(db, school_year_id: int):
    row = fetch_one(
        db,
        "SELECT school_year_id, year_label FROM school_years WHERE school_year_id = %s",
        (school_year_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="School year not found")
    return row


def update_school_year(db, school_year_id: int, payload):
    current = get_school_year(db, school_year_id)
    data = payload.model_dump(exclude_unset=True)

    try:
        row = fetch_one(
            db,
            """
            UPDATE school_years
            SET year_label = %s
            WHERE school_year_id = %s
            RETURNING school_year_id, year_label
            """,
            (
                data.get("year_label", current["year_label"]),
                school_year_id,
            ),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="School year already exists")


def delete_school_year(db, school_year_id: int):
    try:
        row = fetch_one(db, "DELETE FROM school_years WHERE school_year_id = %s RETURNING school_year_id", (school_year_id,))
        if not row:
            raise HTTPException(status_code=404, detail="School year not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)


# School semesters

def _get_school_semester_schema(db) -> tuple[str, str, str]:
    rows = fetch_all(
        db,
        """
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'school_semesters'
        """,
        (),
    )

    by_table: dict[str, set[str]] = {}
    for row in rows:
        table_name = row["table_name"]
        by_table.setdefault(table_name, set()).add(row["column_name"])

    school_semesters_columns = by_table.get("school_semesters", set())
    if school_semesters_columns and "school_semester_id" in school_semesters_columns and "semester_label" in school_semesters_columns:
        return "school_semesters", "school_semester_id", "semester_label"

    raise HTTPException(status_code=500, detail="Unsupported school_semesters table schema")

def create_semester(db, payload):
    semester_table, semester_id_column, semester_name_column = _get_school_semester_schema(db)
    try:
        row = fetch_one(
            db,
            (
                f"INSERT INTO {semester_table} ({semester_name_column}) VALUES (%s) "
                f"RETURNING {semester_id_column} AS semester_id, {semester_name_column} AS name"
            ),
            (payload.name,),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def list_semesters(db, skip: int, limit: int):
    semester_table, semester_id_column, semester_name_column = _get_school_semester_schema(db)
    return fetch_all(
        db,
        (
            f"SELECT {semester_id_column} AS semester_id, {semester_name_column} AS name "
            f"FROM {semester_table} ORDER BY {semester_name_column} ASC OFFSET %s LIMIT %s"
        ),
        (skip, limit),
    )


def get_semester(db, semester_id: int):
    semester_table, semester_id_column, semester_name_column = _get_school_semester_schema(db)
    row = fetch_one(
        db,
        (
            f"SELECT {semester_id_column} AS semester_id, {semester_name_column} AS name "
            f"FROM {semester_table} WHERE {semester_id_column} = %s"
        ),
        (semester_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Semester not found")
    return row


def update_semester(db, semester_id: int, payload):
    current = get_semester(db, semester_id)
    data = payload.model_dump(exclude_unset=True)
    semester_table, semester_id_column, semester_name_column = _get_school_semester_schema(db)

    try:
        row = fetch_one(
            db,
            f"""
            UPDATE {semester_table}
            SET {semester_name_column} = %s
            WHERE {semester_id_column} = %s
            RETURNING {semester_id_column} AS semester_id, {semester_name_column} AS name
            """,
            (data.get("name", current["name"]), semester_id),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc)


def delete_semester(db, semester_id: int):
    semester_table, semester_id_column, _ = _get_school_semester_schema(db)
    try:
        row = fetch_one(
            db,
            f"DELETE FROM {semester_table} WHERE {semester_id_column} = %s RETURNING {semester_id_column} AS semester_id",
            (semester_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Semester not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)


# Research output types

def create_research_output_type(db, payload):
    try:
        row = fetch_one(
            db,
            """
            INSERT INTO research_output_types (output_type_name)
            VALUES (%s)
            RETURNING output_type_id, output_type_name
            """,
            (payload.output_type_name,),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Research output type already exists")


def list_research_output_types(db, skip: int, limit: int):
    return fetch_all(
        db,
        """
        SELECT output_type_id, output_type_name
        FROM research_output_types
        ORDER BY output_type_name ASC
        OFFSET %s LIMIT %s
        """,
        (skip, limit),
    )


def get_research_output_type(db, output_type_id: int):
    row = fetch_one(
        db,
        "SELECT output_type_id, output_type_name FROM research_output_types WHERE output_type_id = %s",
        (output_type_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Research output type not found")
    return row


def update_research_output_type(db, output_type_id: int, payload):
    current = get_research_output_type(db, output_type_id)
    data = payload.model_dump(exclude_unset=True)

    try:
        row = fetch_one(
            db,
            """
            UPDATE research_output_types
            SET output_type_name = %s
            WHERE output_type_id = %s
            RETURNING output_type_id, output_type_name
            """,
            (data.get("output_type_name", current["output_type_name"]), output_type_id),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Research output type already exists")


def delete_research_output_type(db, output_type_id: int):
    try:
        row = fetch_one(
            db,
            "DELETE FROM research_output_types WHERE output_type_id = %s RETURNING output_type_id",
            (output_type_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Research output type not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)


# Research types

def create_research_type(db, payload):
    try:
        row = fetch_one(
            db,
            """
            INSERT INTO research_types (research_type_name)
            VALUES (%s)
            RETURNING research_type_id, research_type_name
            """,
            (payload.research_type_name,),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Research type already exists")


def list_research_types(db, skip: int, limit: int):
    return fetch_all(
        db,
        """
        SELECT research_type_id, research_type_name
        FROM research_types
        ORDER BY research_type_name ASC
        OFFSET %s LIMIT %s
        """,
        (skip, limit),
    )


def get_research_type(db, research_type_id: int):
    row = fetch_one(
        db,
        "SELECT research_type_id, research_type_name FROM research_types WHERE research_type_id = %s",
        (research_type_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Research type not found")
    return row


def update_research_type(db, research_type_id: int, payload):
    current = get_research_type(db, research_type_id)
    data = payload.model_dump(exclude_unset=True)

    try:
        row = fetch_one(
            db,
            """
            UPDATE research_types
            SET research_type_name = %s
            WHERE research_type_id = %s
            RETURNING research_type_id, research_type_name
            """,
            (data.get("research_type_name", current["research_type_name"]), research_type_id),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Research type already exists")


def delete_research_type(db, research_type_id: int):
    try:
        row = fetch_one(
            db,
            "DELETE FROM research_types WHERE research_type_id = %s RETURNING research_type_id",
            (research_type_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Research type not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)


# Roles

def create_role(db, payload):
    try:
        row = fetch_one(
            db,
            """
            INSERT INTO roles (role_name)
            VALUES (%s)
            RETURNING role_id, role_name, created_at
            """,
            (payload.role_name,),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Role already exists")


def list_roles(db, skip: int, limit: int):
    return fetch_all(
        db,
        """
        SELECT role_id, role_name, created_at
        FROM roles
        ORDER BY role_name ASC
        OFFSET %s LIMIT %s
        """,
        (skip, limit),
    )


def get_role(db, role_id: int):
    row = fetch_one(
        db,
        "SELECT role_id, role_name, created_at FROM roles WHERE role_id = %s",
        (role_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Role not found")
    return row


def update_role(db, role_id: int, payload):
    current = get_role(db, role_id)
    data = payload.model_dump(exclude_unset=True)
    try:
        row = fetch_one(
            db,
            """
            UPDATE roles
            SET role_name = %s
            WHERE role_id = %s
            RETURNING role_id, role_name, created_at
            """,
            (data.get("role_name", current["role_name"]), role_id),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Role already exists")


def delete_role(db, role_id: int):
    try:
        row = fetch_one(
            db,
            "DELETE FROM roles WHERE role_id = %s RETURNING role_id",
            (role_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Role not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)


# Indexing

def create_indexing(db, payload):
    try:
        row = fetch_one(
            db,
            """
            INSERT INTO indexing (indexing_name)
            VALUES (%s)
            RETURNING indexing_id, indexing_name
            """,
            (payload.indexing_name,),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Indexing already exists")


def list_indexing(db, skip: int, limit: int):
    return fetch_all(
        db,
        """
        SELECT indexing_id, indexing_name
        FROM indexing
        ORDER BY indexing_name ASC, indexing_id ASC
        OFFSET %s LIMIT %s
        """,
        (skip, limit),
    )


def get_indexing(db, indexing_id: int):
    row = fetch_one(
        db,
        "SELECT indexing_id, indexing_name FROM indexing WHERE indexing_id = %s",
        (indexing_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Indexing not found")
    return row


def update_indexing(db, indexing_id: int, payload):
    current = get_indexing(db, indexing_id)
    data = payload.model_dump(exclude_unset=True)

    try:
        row = fetch_one(
            db,
            """
            UPDATE indexing
            SET indexing_name = %s
            WHERE indexing_id = %s
            RETURNING indexing_id, indexing_name
            """,
            (data.get("indexing_name", current["indexing_name"]), indexing_id),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Indexing already exists")


def delete_indexing(db, indexing_id: int):
    try:
        row = fetch_one(
            db,
            "DELETE FROM indexing WHERE indexing_id = %s RETURNING indexing_id",
            (indexing_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Indexing not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)


# Status

def create_status(db, payload):
    try:
        row = fetch_one(
            db,
            """
            INSERT INTO status (status_name)
            VALUES (%s)
            RETURNING status_id, status_name
            """,
            (payload.status_name,),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Status already exists")


def list_statuses(db, skip: int, limit: int):
    return fetch_all(
        db,
        """
        SELECT status_id, status_name
        FROM status
        ORDER BY status_name ASC, status_id ASC
        OFFSET %s LIMIT %s
        """,
        (skip, limit),
    )


def get_status(db, status_id: int):
    row = fetch_one(
        db,
        "SELECT status_id, status_name FROM status WHERE status_id = %s",
        (status_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Status not found")
    return row


def update_status(db, status_id: int, payload):
    current = get_status(db, status_id)
    data = payload.model_dump(exclude_unset=True)

    try:
        row = fetch_one(
            db,
            """
            UPDATE status
            SET status_name = %s
            WHERE status_id = %s
            RETURNING status_id, status_name
            """,
            (data.get("status_name", current["status_name"]), status_id),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Status already exists")


def delete_status(db, status_id: int):
    try:
        row = fetch_one(
            db,
            "DELETE FROM status WHERE status_id = %s RETURNING status_id",
            (status_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Status not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)


# Statuses and remarks

def create_statuses_and_remarks(db, payload):
    try:
        row = fetch_one(
            db,
            (
                "INSERT INTO statuses_and_remarks (statuses_and_remarks_name) VALUES (%s) "
                "RETURNING statuses_and_remarks_id, statuses_and_remarks_name"
            ),
            (payload.statuses_and_remarks_name,),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Status remark already exists")


def list_statuses_and_remarks(db, skip: int, limit: int):
    return fetch_all(
        db,
        (
            "SELECT statuses_and_remarks_id, statuses_and_remarks_name "
            "FROM statuses_and_remarks "
            "ORDER BY statuses_and_remarks_name ASC, statuses_and_remarks_id ASC OFFSET %s LIMIT %s"
        ),
        (skip, limit),
    )


def get_statuses_and_remarks(db, statuses_and_remarks_id: int):
    row = fetch_one(
        db,
        (
            "SELECT statuses_and_remarks_id, statuses_and_remarks_name "
            "FROM statuses_and_remarks WHERE statuses_and_remarks_id = %s"
        ),
        (statuses_and_remarks_id,),
    )
    if not row:
        raise HTTPException(status_code=404, detail="Status remark not found")
    return row


def update_statuses_and_remarks(db, statuses_and_remarks_id: int, payload):
    current = get_statuses_and_remarks(db, statuses_and_remarks_id)
    data = payload.model_dump(exclude_unset=True)

    try:
        row = fetch_one(
            db,
            (
                "UPDATE statuses_and_remarks SET statuses_and_remarks_name = %s "
                "WHERE statuses_and_remarks_id = %s "
                "RETURNING statuses_and_remarks_id, statuses_and_remarks_name"
            ),
            (
                data.get("statuses_and_remarks_name", current["statuses_and_remarks_name"]),
                statuses_and_remarks_id,
            ),
        )
        db.commit()
        return row
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Status remark already exists")


def delete_statuses_and_remarks(db, statuses_and_remarks_id: int):
    try:
        row = fetch_one(
            db,
            "DELETE FROM statuses_and_remarks WHERE statuses_and_remarks_id = %s "
            "RETURNING statuses_and_remarks_id",
            (statuses_and_remarks_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Status remark not found")
        db.commit()
    except Error as exc:
        raise_db_http_error(db, exc)
