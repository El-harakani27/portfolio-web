import os
import asyncio
import requests
from datetime import date
from fastapi import HTTPException

DAILY_LIMIT = 5
SESSION_LIMIT = 10


def _redis(command: str, *args):
    url = os.getenv("UPSTASH_REDIS_URL")
    token = os.getenv("UPSTASH_REDIS_TOKEN")
    path = "/".join([command] + [str(a) for a in args])
    r = requests.post(
        f"{url}/{path}",
        headers={"Authorization": f"Bearer {token}"},
    )
    return r.json()["result"]


async def check(ip: str, session_id: str):
    today = date.today().isoformat()

    # Daily limit per IP
    ip_key = f"rate:ip:{ip}:{today}"
    ip_count = await asyncio.to_thread(_redis, "incr", ip_key)
    if ip_count == 1:
        await asyncio.to_thread(_redis, "expire", ip_key, 86400)
    if ip_count > DAILY_LIMIT:
        raise HTTPException(status_code=429, detail="Daily limit of 5 questions reached. Come back tomorrow.")

    # Session limit
    session_key = f"session:{session_id}"
    session_count = await asyncio.to_thread(_redis, "incr", session_key)
    if session_count == 1:
        await asyncio.to_thread(_redis, "expire", session_key, 3600)
    if session_count > SESSION_LIMIT:
        raise HTTPException(status_code=429, detail="Session limit of 10 messages reached.")
