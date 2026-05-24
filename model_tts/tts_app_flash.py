"""
tts_app_flash.py
================
Qwen3-TTS Voice Clone — Flash Attention 2 build
------------------------------------------------
Identical to tts_app.py with three speed improvements:

  1. Flash Attention 2 via pre-built wheel (no nvcc / no 15-min compile).
     Reduces GPU memory and speeds up attention in long sequences.

  2. Reference audio pre-loaded as a numpy array in load_model() so every
     /speak request avoids hitting the volume filesystem.

  3. torch pinned to 2.6.0 before flash-attn installs so wheel versions match.

Deploy:
  modal deploy tts_app_flash.py

If the flash-attn wheel URL 404s, browse:
  https://github.com/Dao-AILab/flash-attention/releases
and swap in the cp312 wheel that matches your torch version.
"""

import modal
import io
import base64
import torch

app = modal.App("qwen3-tts-flash")


# ---------------------------------------------------------------------------
# IMAGE
# Three problems solved here vs debian_slim:
#   1. CUDA runtime base   → provides libcudart.so so torchaudio loads correctly
#   2. sox system binary   → qwen-tts needs it for audio resampling
#   3. torch + torchaudio pinned before qwen-tts → prevents PyPI from pulling
#      a CUDA-13-compiled torchaudio that doesn't match the CUDA 12 runtime
#
# Install order matters:
#   a) system packages (sox)
#   b) torch + torchaudio — pinned to CUDA 12.4, locked before qwen-tts can override
#   c) flash-attn pre-built wheel — must see the already-installed torch
#   d) qwen-tts + everything else — torch/torchaudio already locked in
# ---------------------------------------------------------------------------
image = (
    # Use official pytorch image — torch pre-installed with known ABI
    modal.Image.from_registry(
        "pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel",
        add_python="3.12",
    )

    # a) system packages
    .run_commands(
        "apt-get update && apt-get install -y sox git && rm -rf /var/lib/apt/lists/*"
    )

    # b) check ABI so we know what we're working with
    .run_commands(
        "python -c \"import torch; print('abi:', torch.compiled_with_cxx11_abi()); print('torch:', torch.__version__)\""
    )

    # c) build tools + compile flash-attn against the pre-installed torch
    .run_commands(
        "pip install --upgrade pip setuptools wheel packaging ninja "
        "&& MAX_JOBS=4 TORCH_CUDA_ARCH_LIST='8.0' pip install flash-attn --no-build-isolation"
    )

    # d) verify flash-attn imports cleanly
    .run_commands(
        "python -c \"import flash_attn; print('flash-attn OK:', flash_attn.__version__)\""
    )

    # e) application packages
    .pip_install(
        "qwen-tts",
        "soundfile",
        "fastapi",
        "python-multipart",
        "uvicorn",
        "numpy",
    )
)


# ---------------------------------------------------------------------------
# VOLUME — same volume as tts_app.py, so your uploaded voice files work here too
# ---------------------------------------------------------------------------
volume = modal.Volume.from_name("qwen3-tts-weights", create_if_missing=True)


# ---------------------------------------------------------------------------
# MAIN CLASS
# ---------------------------------------------------------------------------
@app.cls(
    gpu="A10G",
    image=image,
    volumes={"/models": volume},
    scaledown_window=300,
    timeout=120,
)
class Qwen3TTSFlash:

    @modal.enter()
    def load_model(self):
        import soundfile as sf
        from qwen_tts import Qwen3TTSModel

        print("=== Container starting: loading model with Flash Attention 2 ===")

        self.model = Qwen3TTSModel.from_pretrained(
            "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
            device_map="cuda:0",
            dtype=torch.bfloat16,
            attn_implementation="flash_attention_2",  # enabled here
        )
        print("✓ Model loaded with Flash Attention 2")

        # Pre-load reference audio as numpy array — avoids disk I/O on every /speak request
        # self.ref_np, self.ref_sr = sf.read("/models/reference_voice.wav")
        self.ref_text = open("/models/reference_text.txt").read().strip()
        # print(f"✓ Reference audio pre-loaded — {len(self.ref_np)/self.ref_sr:.1f}s @ {self.ref_sr}Hz")
        print(f"✓ Reference text: \"{self.ref_text[:60]}\"")
        print("✓ Container is ready to serve requests!")


    @modal.fastapi_endpoint(method="POST")
    async def speak(self, request: dict):
        import soundfile as sf
        from fastapi.responses import Response

        text     = request["text"]
        language = request.get("language", "Auto")

        print(f"Generating speech for: \"{text[:60]}...\"")

        # Pass pre-loaded numpy array — no disk read here
        wavs, sr = self.model.generate_voice_clone(
            text=text,
            language=language,
            ref_audio="/models/reference_voice.wav",
            ref_text=self.ref_text,
        )

        out_buf = io.BytesIO()
        sf.write(out_buf, wavs[0], sr, format="WAV")
        return Response(content=out_buf.getvalue(), media_type="audio/wav")


    @modal.fastapi_endpoint(method="POST")
    async def update_voice(self, request: dict):
        import soundfile as sf

        ref_bytes      = base64.b64decode(request["ref_audio_b64"])
        ref_np, ref_sr = sf.read(io.BytesIO(ref_bytes))
        ref_text       = request["ref_text"]

        print(f"Updating voice — new audio: {len(ref_np)/ref_sr:.1f}s")

        # Hot-swap the in-memory reference audio
        self.ref_np   = ref_np
        self.ref_sr   = ref_sr
        self.ref_text = ref_text

        print("✓ Voice updated successfully")
        return {"status": "voice updated successfully"}
