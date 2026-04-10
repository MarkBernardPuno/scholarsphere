from fastapi import HTTPException
from psycopg2 import Error, errorcodes


def raise_db_http_error(
    db,
    exc: Error,
    *,
    conflict_detail: str = "Resource conflict",
    invalid_detail: str = "Invalid request data",
    default_detail: str = "Database operation failed",
) -> None:
    try:
        db.rollback()
    except Exception:
        pass

    code = getattr(exc, "pgcode", None)

    if code == errorcodes.UNIQUE_VIOLATION:
        raise HTTPException(status_code=409, detail=conflict_detail)

    if code in {
        errorcodes.FOREIGN_KEY_VIOLATION,
        errorcodes.NOT_NULL_VIOLATION,
        errorcodes.CHECK_VIOLATION,
        errorcodes.INVALID_TEXT_REPRESENTATION,
    }:
        raise HTTPException(status_code=400, detail=invalid_detail)

    raise HTTPException(status_code=500, detail=default_detail)
