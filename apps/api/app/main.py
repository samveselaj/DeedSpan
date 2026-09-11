from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from app.config import get_settings
from app.rate_limit import limiter
from app.routers import admin, auth, goal_plans, goals, habits, me, reflections, tasks

settings = get_settings()

app = FastAPI(title="DeedSpan API", version="0.1.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(me.router, tags=["me"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(goals.router, prefix="/goals", tags=["goals"])
app.include_router(goal_plans.router, prefix="/goal-plans", tags=["goals"])
app.include_router(goal_plans.items_router, prefix="/goal-plan-items", tags=["goals"])
app.include_router(habits.router, prefix="/habits", tags=["habits"])
app.include_router(reflections.router, prefix="/reflections", tags=["reflections"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])


@app.get("/health")
async def health():
    return {"ok": True}
