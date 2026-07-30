import bleach


def sanitize_text(
    value: str | None,
    max_length: int = 5000,
) -> str:
    """
    Remove HTML tags and limit input length.

    This protects API endpoints from stored and reflected XSS.
    """
    if value is None:
        return ""

    clean_value = bleach.clean(
        str(value),
        tags=[],
        attributes={},
        protocols=[],
        strip=True,
    )

    return clean_value.strip()[:max_length]