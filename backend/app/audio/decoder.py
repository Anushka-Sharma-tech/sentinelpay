import io

import librosa
import numpy as np
import soundfile as sf


TARGET_SR = 16_000


def decode_audio(audio_bytes: bytes) -> tuple[np.ndarray, int]:
    if not audio_bytes:
        raise ValueError("Audio payload is empty.")

    audio, sr = sf.read(
        io.BytesIO(audio_bytes),
        dtype="float32",
    )

    if audio.ndim > 1:
        audio = np.mean(audio, axis=1)

    audio = audio.astype(np.float32)

    if sr != TARGET_SR:
        audio = librosa.resample(
            audio,
            orig_sr=sr,
            target_sr=TARGET_SR,
        ).astype(np.float32)

    return audio, TARGET_SR