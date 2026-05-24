"""
tts_app.py
==========
Qwen3-TTS Voice Clone — Full Modal Deployment
----------------------------------------------
This file defines a serverless GPU-backed API on Modal that:
  1. Loads the Qwen3-TTS-1.7B-Base model once when the container starts
  2. Reads your reference audio + text from a Modal Volume (uploaded once)
  3. Builds a reusable voice_clone_prompt so every /speak request
     only needs { "text": "..." } — no re-sending audio each time
  4. Exposes an /update_voice endpoint to hot-swap the voice without redeploying

How to run:
  pip install modal
  modal deploy tts_app.py
"""

import modal
import io
import base64
import torch

# ===========================================================================
# 1. APP — the top-level Modal application object
#    Think of this as the "project name" that groups all your functions.
# ===========================================================================
app = modal.App("qwen3-tts-voice-clone")


# ===========================================================================
# 2. CONTAINER IMAGE — defines what software is installed inside the
#    cloud container that runs your code.
#
#    Modal builds this as a Docker-like image. Every .pip_install() call
#    adds Python packages. We chain them so it reads like a recipe.
# ===========================================================================
image = (
    modal.Image.debian_slim(python_version="3.12")   # base OS + Python 3.12

    # Core runtime packages
    .pip_install(
        "qwen-tts",          # official Qwen3-TTS Python package
        "soundfile",         # read/write WAV/FLAC/OGG audio files
        "fastapi",           # web framework that Modal uses for endpoints
        "python-multipart",  # needed by FastAPI for file uploads
        "uvicorn",           # ASGI server (FastAPI runs on top of this)
        "numpy",             # array math — audio data is numpy arrays
    )

    # FlashAttention 2 — dramatically reduces GPU memory usage during inference
    # --no-build-isolation tells pip to build it in the current environment
    # (required because flash-attn needs access to already-installed torch)
)


# ===========================================================================
# 3. VOLUME — a persistent networked filesystem that lives across container
#    restarts. We use it to store two things:
#      a) The downloaded model weights (so cold starts don't re-download them)
#      b) Your reference voice WAV + transcript TXT (uploaded once by you)
#
#    "create_if_missing=True" means Modal creates it automatically the first
#    time this script runs if it doesn't already exist.
# ===========================================================================
volume = modal.Volume.from_name("qwen3-tts-weights", create_if_missing=True)


# ===========================================================================
# 4. THE MAIN CLASS — decorated with @app.cls() to turn it into a Modal
#    "class function". Modal will:
#      - Spin up a container with the image defined above
#      - Attach the volume at /models
#      - Keep the container alive for 300 seconds after the last request
#        (container_idle_timeout) so subsequent requests skip cold start
#      - Kill any single request that takes longer than 120 seconds (timeout)
# ===========================================================================
@app.cls(
    gpu="A10G",                    # GPU type — A10G is the sweet spot for TTS
    image=image,                   # the container image we built above
    volumes={"/models": volume},   # mount our volume at /models inside container
    scaledown_window=60,    # keep container warm for 5 min after last req
    timeout=120,                   # max seconds a single request can run
)
class Qwen3TTSClone:

    # =======================================================================
    # 5. @modal.enter() — runs ONCE when a new container starts up.
    #    This is where we do expensive one-time work:
    #      - Load the model into GPU memory
    #      - Read the reference audio from the volume
    #      - Pre-compute the voice_clone_prompt and store it on self
    #
    #    After this finishes, self.model and self.voice_clone_prompt are
    #    available to every web endpoint below — no re-loading needed.
    # =======================================================================
    @modal.enter()
    def load_model(self):
        import soundfile as sf
        from qwen_tts import Qwen3TTSModel

        print("=== Container starting: loading model into GPU ===")

        # ----------------------------------------------------------------
        # Load the Qwen3-TTS-1.7B-Base model
        #   device_map="cuda:0"        → put model on the first (only) GPU
        #   dtype=torch.bfloat16       → use bfloat16 precision to save VRAM
        #                                (half the memory vs float32, minimal quality loss)
        #   attn_implementation=...    → use FlashAttention 2 for faster attention
        # ----------------------------------------------------------------
        self.model = Qwen3TTSModel.from_pretrained(
            "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
            device_map="cuda:0",
            dtype=torch.bfloat16,
        )
        print("✓ Model loaded into GPU memory")

        # ----------------------------------------------------------------
        # Read your reference voice files from the Modal Volume.
        # These were uploaded once using upload_voice.py.
        #
        #   /models/reference_voice.wav  — a 5-15 second WAV of your voice
        #   /models/reference_text.txt   — exact transcript of that WAV
        #
        # soundfile.read() returns:
        #   ref_np  → numpy array of audio samples  (shape: [n_samples] or [n_samples, channels])
        #   ref_sr  → sample rate in Hz (e.g. 16000, 24000, 44100)
        # ----------------------------------------------------------------
        # self.ref_np, self.ref_sr = sf.read("/models/reference_voice.wav")
        self.ref_text = open("/models/reference_text.txt").read().strip()
        # print(f"✓ Reference audio loaded — {len(self.ref_np)/self.ref_sr:.1f}s @ {self.ref_sr}Hz")
        print(f"✓ Reference text: \"{self.ref_text[:60]}\"")
        print("✓ Container is ready to serve requests!")


    # =======================================================================
    # 6. /speak ENDPOINT — the main endpoint your app calls.
    #
    #    @modal.web_endpoint(method="POST") turns this method into an
    #    HTTPS POST endpoint. Modal gives you a URL like:
    #      https://your-workspace--qwen3-tts-voice-clone-speak.modal.run
    #
    #    Request body (JSON):
    #      {
    #        "text":     "Hello, this will be spoken in the cloned voice",
    #        "language": "English"   ← optional, defaults to Auto-detect
    #      }
    #
    #    Response (JSON):
    #      {
    #        "audio_b64":   "<base64-encoded WAV audio>",
    #        "sample_rate": 24000
    #      }
    # =======================================================================
    @modal.fastapi_endpoint(method="POST")
    async def speak(self, request: dict):
        import soundfile as sf

        text     = request["text"]
        language = request.get("language", "Auto")  # Auto = model detects language

        print(f"Generating speech for: \"{text[:60]}...\"")

        # ----------------------------------------------------------------
        # generate_voice_clone() synthesizes speech using:
        #   text               → what to say
        #   language           → which language (or Auto for detection)
        #   voice_clone_prompt → the pre-computed speaker characteristics
        #                        (no reference audio needed here!)
        #
        # Returns:
        #   wavs → list of numpy arrays, one per input text
        #          (we sent one string so wavs[0] is our audio)
        #   sr   → sample rate of the output audio (typically 24000)
        # ----------------------------------------------------------------
        wavs, sr = self.model.generate_voice_clone(
            text=text,
            language=language,
            ref_audio="/models/reference_voice.wav",
            ref_text=self.ref_text,
        )

        from fastapi.responses import Response

        out_buf = io.BytesIO()
        sf.write(out_buf, wavs[0], sr, format="WAV")
        return Response(content=out_buf.getvalue(), media_type="audio/wav")


    # =======================================================================
    # 7. /update_voice ENDPOINT — lets you swap the reference voice
    #    at runtime without redeploying the entire app.
    #
    #    Useful when:
    #      - You want to test a different reference recording
    #      - You need to support multiple users with their own voice profiles
    #        (you'd extend this to store per-user prompts)
    #
    #    Request body (JSON):
    #      {
    #        "ref_audio_b64": "<base64-encoded WAV>",
    #        "ref_text":      "Exact transcript of the reference audio"
    #      }
    #
    #    Response (JSON):
    #      { "status": "voice updated successfully" }
    # =======================================================================
    @modal.fastapi_endpoint(method="POST")
    async def update_voice(self, request: dict):
        import soundfile as sf

        # Decode the incoming base64 audio back into a numpy array
        ref_bytes      = base64.b64decode(request["ref_audio_b64"])
        ref_np, ref_sr = sf.read(io.BytesIO(ref_bytes))
        ref_text       = request["ref_text"]

        print(f"Updating voice — new audio: {len(ref_np)/ref_sr:.1f}s")

        # Re-compute and overwrite the cached voice clone prompt
        self.voice_clone_prompt = self.model.create_voice_clone_prompt(
            ref_audio=(ref_np, ref_sr),
            ref_text=ref_text,
        )

        print("✓ Voice updated successfully")
        return {"status": "voice updated successfully"}