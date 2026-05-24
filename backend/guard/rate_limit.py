import os
import asyncio
import requests
from datetime import date
from fastapi import HTTPException

DAILY_LIMIT = 5


def _redis(command: str, *args):
    url = os.getenv("UPSTASH_REDIS_URL")
    token = os.getenv("UPSTASH_REDIS_TOKEN")
    if not url or not token:
        raise RuntimeError("UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN must be set")
    path = "/".join([command] + [str(a) for a in args])
    r = requests.post(
        f"{url}/{path}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=5,
    )
    r.raise_for_status()
    body = r.json()
    if "result" not in body:
        raise RuntimeError(f"Unexpected Redis response: {body}")
    return body["result"]


async def check(session_id: str):
    today = date.today().isoformat()
    session_key = f"rate:session:{session_id}:{today}"
    try:
        count = await asyncio.to_thread(_redis, "incr", session_key)
        if count == 1:
            await asyncio.to_thread(_redis, "expire", session_key, 86400)
    except Exception:
        # If Redis is unavailable, allow the request through rather than blocking all users.
        return
    if count > DAILY_LIMIT:
        raise HTTPException(status_code=429, detail="Daily limit of 5 requests reached. Come back tomorrow.")


async def get_remaining(session_id: str) -> int:
    today = date.today().isoformat()
    session_key = f"rate:session:{session_id}:{today}"
    try:
        count = await asyncio.to_thread(_redis, "get", session_key)
    except Exception:
        return DAILY_LIMIT
    used = int(count) if count is not None else 0
    return max(0, DAILY_LIMIT - used)
