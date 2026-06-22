from fastapi import APIRouter, HTTPException, Request, Response, status
from src.api.rest.dependencies import DBSession
from src.config.security import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from src.core.services.auth_service import AuthService
from src.schemas.auth.login_request import LoginRequest
from src.schemas.auth.register_request import RegisterRequest
from src.schemas.auth.token_response import TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

# Cookie max_age in seconds
ACCESS_COOKIE_MAX_AGE = ACCESS_TOKEN_EXPIRE_MINUTES * 60
REFRESH_COOKIE_MAX_AGE = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


def _set_auth_cookies(
    response: Response, access_token: str, refresh_token: str
) -> None:
    """Set persistent HTTP-only auth cookies."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_COOKIE_MAX_AGE,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set True in production (requires HTTPS)
        samesite="lax",
        max_age=REFRESH_COOKIE_MAX_AGE,
        path="/",
    )


@router.post("/register", response_model=TokenResponse)
def register(
    request: RegisterRequest,
    response: Response,
    db: DBSession,
):
    auth_service = AuthService(db)
    result = auth_service.register(request)

    _set_auth_cookies(response, result["access_token"], result["refresh_token"])

    return TokenResponse(
        access_token=result["access_token"],
        profile_completed=result["profile_completed"],
    )


@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    response: Response,
    db: DBSession,
):
    auth_service = AuthService(db)
    result = auth_service.login(request)

    _set_auth_cookies(response, result["access_token"], result["refresh_token"])

    return TokenResponse(
        access_token=result["access_token"],
        profile_completed=result["profile_completed"],
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    raw_request: Request,
    response: Response,
    db: DBSession,
):
    refresh_token = raw_request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token not found"
        )

    auth_service = AuthService(db)
    result = auth_service.refresh(refresh_token)

    _set_auth_cookies(response, result["access_token"], result["refresh_token"])

    return TokenResponse(
        access_token=result["access_token"],
        profile_completed=result["profile_completed"],
    )


@router.post("/logout")
def logout(
    raw_request: Request,
    response: Response,
    db: DBSession,
):
    refresh_token = raw_request.cookies.get("refresh_token")
    if refresh_token:
        auth_service = AuthService(db)
        auth_service.logout(refresh_token)

    # Clear cookies
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")

    return {"message": "Logged out successfully"}
