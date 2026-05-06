import os
import io
import wave
import requests
import numpy as np

SILMA_API_URL = "https://api.silma.ai/tts/v2/stream"
SAMPLE_RATE = 24000


def synthesize(text: str) -> bytes:
    api_key = os.getenv("SILMA_API_KEY")
    user_id = os.getenv("SILMA_USER_ID")
    custom_audio_id = os.getenv("SILMA_CUSTOM_AUDIO_ID")

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "apiKey": api_key,
    }

    payload = {
        "model_id": "silma-tts-v2-ksa",
        "text": text,
        "creativity": 0.2,
        "speed": 0.2,
        "voice_id": "salma",
    }

    if user_id and custom_audio_id:
        payload["user_id"] = user_id
        payload["custom_audio_id"] = custom_audio_id

    carry_over = b""
    chunks = []

    with requests.Session().post(SILMA_API_URL, json=payload, headers=headers, stream=True) as r:
        r.raise_for_status()
        for chunk in r.iter_content(chunk_size=None):
            if chunk:
                current_data = carry_over + chunk
                num_floats = len(current_data) // 4
                cut_off = num_floats * 4
                valid_bytes = current_data[:cut_off]
                carry_over = current_data[cut_off:]
                if valid_bytes:
                    chunks.append(np.frombuffer(valid_bytes, dtype=np.float32))

    if not chunks:
        return b""

    return _to_wav(np.concatenate(chunks))


def _to_wav(audio: np.ndarray) -> bytes:
    audio_int16 = (np.clip(audio, -1.0, 1.0) * 32767).astype(np.int16)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio_int16.tobytes())
    return buf.getvalue()
