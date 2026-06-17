from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.rate_limit import limiter
from app.schemas.auth import LoginIn, MobileAuthOut, RegisterIn
from app.schemas.user import UserOut
from app.security import hash_password, verify_password
from app.services.session_service import (
    create_mobile_session,
    create_session,
    destroy_session,
)

router = APIRouter()


# ---------- web (cookie) ----------


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(
    request: Request,
    response: Response,
    payload: RegisterIn,
    db: AsyncSession = Depends(get_db),
):
    existing = await db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(email=payload.email.lower(), password_hash=hash_password(payload.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)

    await create_session(db, user, request, response)
    return user


@router.post("/login", response_model=UserOut)
@limiter.limit("10/minute")
async def login(
    request: Request,
    response: Response,
    payload: LoginIn,
    db: AsyncSession = Depends(get_db),
):
    user = await db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(user.password_hash, payload.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    if user.is_disabled:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")

    await create_session(db, user, request, response)
    return user


# ---------- mobile (bearer) ----------


@router.post(
    "/mobile/register", response_model=MobileAuthOut, status_code=status.HTTP_201_CREATED
)
@limiter.limit("10/minute")
async def mobile_register(
    request: Request,
    payload: RegisterIn,
    db: AsyncSession = Depends(get_db),
):
    existing = await db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(email=payload.email.lower(), password_hash=hash_password(payload.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)

    session = await create_mobile_session(db, user, request)
    return MobileAuthOut(session_id=session.id, expires_at=session.expires_at, user=user)


@router.post("/mobile/login", response_model=MobileAuthOut)
@limiter.limit("10/minute")
async def mobile_login(
    request: Request,
    payload: LoginIn,
    db: AsyncSession = Depends(get_db),
):
    user = await db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(user.password_hash, payload.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    if user.is_disabled:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")

    session = await create_mobile_session(db, user, request)
    return MobileAuthOut(session_id=session.id, expires_at=session.expires_at, user=user)


# ---------- shared ----------


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # `get_current_user` attaches the resolved session to request.state,
    # so this revokes the right one whether the caller used a cookie or a Bearer token.
    sid = request.state.session.id
    await destroy_session(db, response, sid)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
