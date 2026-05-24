import tempfile
import os
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from models import whisper
from agent import graph
from guard import rate_limit
from dotenv import load_dotenv
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


async def _stream_from_modal(text: str, language: str):
    async with httpx.AsyncClient(timeout=300.0) as client:
        async with client.stream(
            "POST", _TTS_URL, json={"text": text, "language": language}
        ) as resp:
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail="TTS service error")
            async for chunk in resp.aiter_bytes(8192):
                yield chunk


@router.post("/tts")
async def tts(req: TtsRequest):
    language = _LANG_MAP.get(req.language, "Auto")
    return StreamingResponse(
        _stream_from_modal(req.text, language),
        media_type="audio/wav",
        headers={"Cache-Control": "no-store"},
    )
