import secrets
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from app.config import get_settings

settings = get_settings()

_hasher = PasswordHasher(time_cost=3, memory_cost=64 * 1024, parallelism=2)

SESSION_COOKIE = "aether_sid"
CSRF_COOKIE = "aether_csrf"
CSRF_HEADER = "X-CSRF-Token"


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(hashed: str, password: str) -> bool:
    try:
        _hasher.verify(hashed, password)
        return True
    except VerifyMismatchError:
        return False


def generate_token(nbytes: int = 32) -> str:
    return secrets.token_urlsafe(nbytes)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def session_expiry() -> datetime:
    return now_utc() + timedelta(days=settings.session_ttl_days)


def cookie_kwargs(max_age: int | None) -> dict:
    return {
        "max_age": max_age,
        "httponly": True,
        "secure": settings.is_prod,
        "samesite": "lax",
        "path": "/",
        "domain": settings.cookie_domain or None,
    }
