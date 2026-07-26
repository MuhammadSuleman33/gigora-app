import html
import re

from fastapi import HTTPException


MAX_INPUT_LENGTH = 2000

# Removes basic HTML tags such as:
# <script>, <b>, <div class="...">, etc.
REMOVE_HTML_RE = re.compile(r"<[^>]*>")


def sanitize_text(
    value: str,
    field_name: str,
    max_length: int = MAX_INPUT_LENGTH
) -> str:
    """
    Sanitize user-provided text.

    Rules:
    1. Value must exist.
    2. Value must be a string.
    3. Original input cannot exceed the maximum length.
    4. HTML tags are removed.
    5. HTML entities are decoded.
    6. Empty text is rejected.
    7. Cleaned text cannot exceed the maximum length.
    """

    if value is None:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} is required."
        )

    if not isinstance(value, str):
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} must be valid text."
        )

    # Prevent users from sending extremely large raw payloads.
    if len(value) > max_length:
        raise HTTPException(
            status_code=400,
            detail=(
                f"{field_name} is too long. "
                f"Please limit it to {max_length} characters."
            )
        )

    # Decode entities such as &lt;b&gt; before removing tags.
    decoded_value = html.unescape(value)

    cleaned = REMOVE_HTML_RE.sub("", decoded_value).strip()

    if not cleaned:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} cannot be empty."
        )

    if len(cleaned) > max_length:
        raise HTTPException(
            status_code=400,
            detail=(
                f"{field_name} is too long. "
                f"Please limit it to {max_length} characters."
            )
        )

    return cleaned