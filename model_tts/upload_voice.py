"""
upload_voice.py
===============
Run this script ONCE before deploying tts_app.py.
It uploads your local reference voice files into the Modal Volume
so the model can read them at startup.

Usage:
  modal run upload_voice.py

What it does:
  Copies reference_voice.wav and reference_text.txt from your local machine
  into the Modal Volume at /models/, making them available to the container.

Requirements:
  - reference_voice.wav  must exist in the same folder as this script
  - reference_text.txt   must exist in the same folder as this script

Tips for good reference audio:
  - Duration:  5–15 seconds (shorter = less accurate clone)
  - Quality:   No background noise, no music, no echo
  - Format:    WAV is ideal (MP3/M4A also work — soundfile handles conversion)
  - Content:   Normal speaking pace, natural tone
  - ref_text:  Must be the EXACT transcript of what was spoken — even
               small differences (like "gonna" vs "going to") affect quality
"""

import modal

# Reference the same volume defined in tts_app.py
# "create_if_missing=True" so this script can also create it if needed
volume = modal.Volume.from_name("qwen3-tts-weights", create_if_missing=True)

app = modal.App("upload-voice-files")

# File names — must exist in the same folder as this script
WAV_FILENAME = "reference_voice.wav"
TXT_FILENAME = "reference_text.txt"

@app.function(volumes={"/models": volume})
def upload_files(wav_bytes: bytes, txt_content: str):
    """
    Runs inside a Modal Linux container — cannot access local Windows paths.
    File bytes are read locally in main() and passed here as arguments.
    """
    import os

    wav_dst = f"/models/{WAV_FILENAME}"
    txt_dst = f"/models/{TXT_FILENAME}"

    with open(wav_dst, "wb") as f:
        f.write(wav_bytes)
    size_kb = os.path.getsize(wav_dst) / 1024
    print(f"✓ Uploaded {WAV_FILENAME} ({size_kb:.1f} KB) → {wav_dst}")

    with open(txt_dst, "w", encoding="utf-8") as f:
        f.write(txt_content)
    print(f"✓ Uploaded {TXT_FILENAME} → {txt_dst}")
    print(f"  Content: \"{txt_content.strip()}\"")

    # Commit the volume — required to persist changes
    # Without this, writes are lost when the container stops
    volume.commit()
    print("\n✓ Volume committed — files are now persistent!")
    print("  You can now run:  modal deploy tts_app.py")


@app.local_entrypoint()
def main():
    import pathlib
    here = pathlib.Path(__file__).parent  # same folder as this script

    wav_bytes = (here / WAV_FILENAME).read_bytes()
    txt_content = (here / TXT_FILENAME).read_text(encoding="utf-8")

    print("Uploading reference voice files to Modal Volume...")
    upload_files.remote(wav_bytes, txt_content)
    print("Done!")