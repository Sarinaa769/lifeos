import subprocess
import tempfile
import os
from faster_whisper import WhisperModel
from app.core.config import settings

_model = WhisperModel("medium", device="cpu", compute_type="int8")


def _to_wav(input_path: str) -> str:
    fd, wav_path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", wav_path],
        check=True,
        capture_output=True,
    )
    return wav_path


def transcribe(audio_path: str) -> str:
    wav_path = _to_wav(audio_path)
    try:
        segments, info = _model.transcribe(wav_path, language="fa", vad_filter=True)
        segments = list(segments)
        return " ".join(s.text.strip() for s in segments)
    finally:
        os.remove(wav_path)