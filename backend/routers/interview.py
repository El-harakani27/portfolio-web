import asyncio
import tempfile
import os
from fastapi import APIRouter, UploadFile, File, Request
from fastapi.responses import Response
from pydantic import BaseModel
from models import whisper, silma
from agent import graph
from guard import rate_limit

router = APIRouter(prefix="/interview", tags=["Interview"])


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    session_id: str = "default"


class SpeakRequest(BaseModel):
    text: str


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        result = whisper.transcribe(tmp_path)
    finally:
        os.remove(tmp_path)

    return result


@router.post("/chat")
async def chat(req: ChatRequest, request: Request):
    await rate_limit.check(request.client.host, req.session_id)
    response = await graph.run_agent(req.message, req.language, req.session_id)
    return {"response": response}


@router.post("/speak")
async def speak(req: SpeakRequest):
    audio_bytes = await asyncio.to_thread(silma.synthesize, req.text)
    return Response(content=audio_bytes, media_type="audio/wav")
