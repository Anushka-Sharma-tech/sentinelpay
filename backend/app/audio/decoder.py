from __future__ import annotations

import io

import librosa
import numpy as np
import soundfile as sf


class AudioDecodeError(Exception):
    pass


def decode_audio(
    audio_bytes: bytes,
    target_sr: int = 16000,
) -> tuple[np.ndarray, int]:
    """
    Decode arbitrary supported audio bytes into mono float32 waveform.
    """

    if not audio_bytes:
        raise AudioDecodeError("Audio payload is empty.")

    try:
        audio_buffer = io.BytesIO(audio_bytes)
        waveform, sample_rate = sf.read(audio_buffer, dtype="float32")

    except Exception as exc:
        raise AudioDecodeError("Unable to decode audio.") from exc

    if waveform.ndim == 2:
        waveform = waveform.mean(axis=1)

    waveform = np.asarray(waveform, dtype=np.float32)

    if waveform.size == 0:
        raise AudioDecodeError("Decoded audio is empty.")

    if sample_rate != target_sr:
        waveform = librosa.resample(
            waveform,
            orig_sr=sample_rate,
            target_sr=target_sr,
        )
        sample_rate = target_sr

    peak = np.max(np.abs(waveform))

    if peak > 0:
        waveform = waveform / peak

    return waveform.astype(np.float32), sample_rate