import tempfile
import os
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from models import whisper
from agent import graph

router = APIRouter(prefix="/interview", tags=["Interview"])


class ChatRequest(BaseModel):
    message: str
    language: str = "en"


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
async def chat(req: ChatRequest):
    response = await graph.run_agent(req.message, req.language)
    return {"response": response}
