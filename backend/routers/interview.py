import tempfile
import os
import logging
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from models import whisper
from agent import graph
from guard import rate_limit
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
load_dotenv()
router = APIRouter(prefix="/interview", tags=["Interview"])

_TTS_URL = os.getenv("TTS_URL")

_LANG_MAP: dict[str, str] = {
    "en": "English",  "fr": "French",   "ar": "Arabic",  "zh": "Chinese",
    "de": "German",   "es": "Spanish",  "it": "Italian", "pt": "Portuguese",
    "ru": "Russian",  "ja": "Japanese", "ko": "Korean",  "nl": "Dutch",
    "pl": "Polish",   "tr": "Turkish",  "fa": "Persian", "he": "Hebrew",
    "hi": "Hindi",
}


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"


class TtsRequest(BaseModel):
    text: str
    language: str = "en"


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(await audio.read())
            tmp_path = tmp.name
        result = whisper.transcribe(tmp_path)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.get("/remaining")
async def remaining(session_id: str = "default"):
    remaining = await rate_limit.get_remaining(session_id)
    return {"remaining": remaining, "limit": rate_limit.DAILY_LIMIT}


@router.post("/chat")
async def chat(req: ChatRequest):
    await rate_limit.check(req.session_id)
    response = await graph.run_agent(req.message, req.session_id)
    return {"response": response}


async def _stream_tts(text: str, language: str):
    """Stream audio from Modal; logs errors but keeps the 200 open so platform
    proxies don't time out waiting for the first byte."""
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            async with client.stream(
                "POST", _TTS_URL, json={"text": text, "language": language}
            ) as resp:
                if resp.status_code != 200:
                    body = await resp.aread()
                    logger.error("TTS Modal returned %s: %s", resp.status_code, body[:500])
                    return
                logger.info("TTS streaming started <- status=%s", resp.status_code)
                async for chunk in resp.aiter_bytes(8192):
                    yield chunk
    except Exception as e:
        logger.exception("TTS stream error: %s", e)


@router.post("/tts")
async def tts(req: TtsRequest):
    if not _TTS_URL:
        raise HTTPException(status_code=503, detail="TTS service not configured")
    language = _LANG_MAP.get(req.language, "Auto")
    logger.info("TTS -> %s | lang=%s | %.80s", _TTS_URL, language, req.text)
    # StreamingResponse commits 200 + headers immediately, satisfying platform
    # proxy timeouts while Modal cold-starts in the background.
    return StreamingResponse(
        _stream_tts(req.text, language),
        media_type="audio/wav",
        headers={"Cache-Control": "no-store"},
    )
