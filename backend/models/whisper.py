import torch
from faster_whisper import WhisperModel
from qwen_asr import Qwen3ASRModel

_model = None
_model_name: str = "whisper"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
COMPUTE_TYPE = "float16" if DEVICE == "cuda" else "int8"


def load_model(name: str = "whisper"):
    global _model, _model_name
    _model_name = name
    if _model_name == "qwen":
        _model = Qwen3ASRModel.from_pretrained(
            "Qwen/Qwen3-ASR-0.6B",
            dtype=torch.bfloat16,
            device_map=DEVICE,
            max_inference_batch_size=4,
            max_new_tokens=256,
        )
        print(f"Qwen model loaded on {DEVICE}")
    else:
        _model = WhisperModel("medium", device=DEVICE, compute_type=COMPUTE_TYPE)
        print(f"Whisper model loaded on {DEVICE}")


def transcribe(audio_path: str) -> dict:
    if _model_name == "qwen":
        result = _model.transcribe(audio_path)
        return {"transcript": result[-1].text, "language": result[-1].language}
    else:
        segments, info = _model.transcribe(audio_path, beam_size=5)
        text = " ".join(segment.text.strip() for segment in segments)
        return {"transcript": text, "language": info.language}
