import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client: Groq = None
_model: str = "distil-whisper-large-v3-en"


def load_model(name: str = "whisper-large-v3-turbo"):
    global _client, _model
    _model = name
    _client = Groq(api_key=os.getenv("GROQ_WHISPER_API_KEY"))


def transcribe(audio_path: str) -> dict:
    with open(audio_path, "rb") as f:
        result = _client.audio.transcriptions.create(
            file=(os.path.basename(audio_path), f),
            model=_model,
            language="en",
            response_format="json",
        )
    return {"transcript": result.text, "language": "en"}