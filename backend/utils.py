import re
from fastapi import HTTPException

MAX_INPUT_LENGTH = 2000

REMOVE_HTML_RE = re.compile(r"<[^>]+>")


def sanitize_text(value: str, field_name: str) -> str:
    if value is None:
        raise HTTPException(status_code=400, detail=f"{field_name} is required.")

    cleaned = REMOVE_HTML_RE.sub("", value).strip()

    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_name} cannot be empty.")

    if len(cleaned) > MAX_INPUT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=(
                f"{field_name} is too long. "
                f"Please limit to {MAX_INPUT_LENGTH} characters."
            ),
        )

    return cleaned
