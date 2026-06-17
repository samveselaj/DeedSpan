from pydantic import BaseModel


class AdminMetrics(BaseModel):
    user_count: int
    active_7d: int
    tasks_created_7d: int
    habits_total: int
