from datetime import date, timedelta

DECADE_YEARS = 10


def week_bounds(today: date) -> tuple[date, date]:
    """Monday through Sunday of the week containing `today`."""
    monday = today - timedelta(days=today.weekday())
    return monday, monday + timedelta(days=6)


def month_bounds(today: date) -> tuple[date, date]:
    first = today.replace(day=1)
    if first.month == 12:
        next_first = first.replace(year=first.year + 1, month=1)
    else:
        next_first = first.replace(month=first.month + 1)
    return first, next_first - timedelta(days=1)


def year_bounds(today: date) -> tuple[date, date]:
    return date(today.year, 1, 1), date(today.year, 12, 31)


def decade_bounds(today: date) -> tuple[date, date]:
    return date(today.year, 1, 1), date(today.year + DECADE_YEARS, 12, 31)


def compute_bounds(period_type: str, today: date) -> tuple[date, date]:
    if period_type == "week":
        return week_bounds(today)
    if period_type == "month":
        return month_bounds(today)
    if period_type == "year":
        return year_bounds(today)
    if period_type == "decade":
        return decade_bounds(today)
    raise ValueError(f"compute_bounds not applicable for period_type={period_type!r}")


def progress_label(
    period_type: str,
    period_start: date,
    period_end: date,
    today: date,
) -> tuple[int, int, str]:
    """Return (day_index, total_days, human label) suited to `period_type`."""
    total_days = (period_end - period_start).days + 1
    raw = (today - period_start).days + 1
    day_index = max(1, min(total_days, raw))

    if period_type == "decade":
        year_index = max(1, min(DECADE_YEARS, today.year - period_start.year + 1))
        label = f"Year {year_index} of {DECADE_YEARS}"
    elif period_type == "week":
        label = f"Day {day_index} of 7"
    else:
        label = f"Day {day_index} of {total_days}"

    return day_index, total_days, label
