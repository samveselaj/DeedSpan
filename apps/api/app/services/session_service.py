from fastapi import Request, Response
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.session import Session as SessionModel
from app.models.user import User
from app.security import (
    CSRF_COOKIE,
    SESSION_COOKIE,
    cookie_kwargs,
    generate_token,
    now_utc,
    session_expiry,
)

settings = get_settings()


async def _create_session_row(
    db: AsyncSession, user: User, request: Request
) -> SessionModel:
    """Shared session creation. Cleans up expired sessions opportunistically."""
    await db.execute(delete(SessionModel).where(SessionModel.expires_at < now_utc()))

    session = SessionModel(
        id=generate_token(32),
        user_id=user.id,
        csrf_token=generate_token(24),
        expires_at=session_expiry(),
        user_agent=request.headers.get("user-agent", "")[:512] or None,
        ip_address=request.client.host if request.client else None,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def create_session(
    db: AsyncSession, user: User, request: Request, response: Response
) -> SessionModel:
    """Cookie-based session for the web client. Sets both cookies on the response."""
    session = await _create_session_row(db, user, request)

    max_age = settings.session_ttl_days * 24 * 3600
    response.set_cookie(SESSION_COOKIE, session.id, **cookie_kwargs(max_age))
    response.set_cookie(
        CSRF_COOKIE,
        session.csrf_token,
        max_age=max_age,
        httponly=False,
        secure=settings.is_prod,
        samesite="lax",
        path="/",
        domain=settings.cookie_domain or None,
    )
    return session


async def create_mobile_session(
    db: AsyncSession, user: User, request: Request
) -> SessionModel:
    """Bearer-based session for the mobile client. No cookies are set."""
    return await _create_session_row(db, user, request)


async def destroy_session(db: AsyncSession, response: Response, session_id: str) -> None:
    """
    Delete the session row and clear cookies. The cookie clears are no-ops for
    bearer-authenticated requests (no Set-Cookie effect on a client that ignores it).
    """
    await db.execute(delete(SessionModel).where(SessionModel.id == session_id))
    await db.commit()
    response.delete_cookie(SESSION_COOKIE, path="/", domain=settings.cookie_domain or None)
    response.delete_cookie(CSRF_COOKIE, path="/", domain=settings.cookie_domain or None)
