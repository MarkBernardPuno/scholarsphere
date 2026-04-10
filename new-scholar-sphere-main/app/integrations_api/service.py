from database.database import fetch_one


def _get_school_semester_schema(db) -> tuple[str, str, str]:
    columns = db.cursor()
    try:
        columns.execute(
            """
            SELECT table_name, column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
                            AND table_name = 'school_semesters'
            """
        )
        found = columns.fetchall()
    finally:
        columns.close()

    by_table: dict[str, set[str]] = {}
    for table_name, column_name in found:
        by_table.setdefault(table_name, set()).add(column_name)

    school_semesters_columns = by_table.get("school_semesters", set())
    if school_semesters_columns and "school_semester_id" in school_semesters_columns and "semester_label" in school_semesters_columns:
        return "school_semesters", "school_semester_id", "semester_label"

    raise ValueError("Unsupported school_semesters table schema")


def populate_defaults(db):
    created_semesters = 0
    created_research_types = 0
    created_output_types = 0
    semester_table, semester_id_column, semester_name_column = _get_school_semester_schema(db)

    for semester_name in ["1st Semester", "2nd Semester", "Summer"]:
        existing = fetch_one(
            db,
            f"SELECT {semester_id_column} FROM {semester_table} WHERE {semester_name_column} = %s",
            (semester_name,),
        )
        if not existing:
            fetch_one(
                db,
                f"INSERT INTO {semester_table} ({semester_name_column}) VALUES (%s) RETURNING {semester_id_column}",
                (semester_name,),
            )
            created_semesters += 1

    for type_name in ["Basic Research", "Applied Research", "Action Research"]:
        existing = fetch_one(
            db,
            "SELECT research_type_id FROM research_types WHERE research_type_name = %s",
            (type_name,),
        )
        if not existing:
            fetch_one(
                db,
                "INSERT INTO research_types (research_type_name) VALUES (%s) RETURNING research_type_id",
                (type_name,),
            )
            created_research_types += 1

    for output_name in ["Presentation", "Publication", "International Presentation", "International Publication"]:
        existing = fetch_one(
            db,
            "SELECT output_type_id FROM research_output_types WHERE output_type_name = %s",
            (output_name,),
        )
        if not existing:
            fetch_one(
                db,
                "INSERT INTO research_output_types (output_type_name) VALUES (%s) RETURNING output_type_id",
                (output_name,),
            )
            created_output_types += 1

    db.commit()
    return {
        "message": "Defaults populated",
        "created_semesters": created_semesters,
        "created_research_types": created_research_types,
        "created_research_output_types": created_output_types,
    }


def email_test(recipient: str):
    return {
        "message": "Email test accepted",
        "recipient": recipient,
        "status": "queued",
    }
