from fastapi import Response
from src.config.security import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS

# Cookie max_age in seconds
ACCESS_COOKIE_MAX_AGE = ACCESS_TOKEN_EXPIRE_MINUTES * 60
REFRESH_COOKIE_MAX_AGE = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


def set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: str,
) -> None:
    """Set persistent HTTP-only auth cookies on the response."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set True in production (requires HTTPS)
        samesite="lax",
        max_age=ACCESS_COOKIE_MAX_AGE,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set True in production (requires HTTPS)
        samesite="lax",
        max_age=REFRESH_COOKIE_MAX_AGE,
    )


def clear_auth_cookies(response: Response) -> None:
    """Remove auth cookies from the response."""
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
