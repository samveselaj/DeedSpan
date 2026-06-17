from typing import Literal

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.session import Session as SessionModel
from app.models.user import User
from app.security import CSRF_COOKIE, CSRF_HEADER, SESSION_COOKIE, now_utc

UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

AuthMethod = Literal["cookie", "bearer"]


def _extract_session_token(request: Request) -> tuple[str | None, AuthMethod | None]:
    """
    Returns (token, method). Bearer takes precedence over cookie so that a
    mobile app testing against a browser cookie jar can override.
    """
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:].strip()
        if token:
            return token, "bearer"

    sid = request.cookies.get(SESSION_COOKIE)
    if sid:
        return sid, "cookie"

    return None, None


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    token, auth_method = _extract_session_token(request)
    if not token or not auth_method:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")

    result = await db.execute(
        select(SessionModel, User)
        .join(User, User.id == SessionModel.user_id)
        .where(SessionModel.id == token)
    )
    row = result.first()
    if not row:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session")

    session, user = row
    if session.expires_at < now_utc():
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired")
    if user.is_disabled:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")

    # CSRF protection applies only to cookie-authenticated browser requests.
    # Bearer requests cannot be initiated cross-site by a victim's browser, so
    # the same-origin/double-submit threat model doesn't apply.
    if auth_method == "cookie" and request.method in UNSAFE_METHODS:
        cookie_csrf = request.cookies.get(CSRF_COOKIE)
        header_csrf = request.headers.get(CSRF_HEADER)
        if not cookie_csrf or cookie_csrf != header_csrf or cookie_csrf != session.csrf_token:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "CSRF validation failed")

    if (now_utc() - session.last_seen_at).total_seconds() > 60:
        session.last_seen_at = now_utc()
        await db.commit()

    request.state.session = session
    request.state.auth_method = auth_method
    return user


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return user
