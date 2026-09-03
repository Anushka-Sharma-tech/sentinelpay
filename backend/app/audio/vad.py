import numpy as np
import librosa


def speech_activity(audio: np.ndarray) -> dict:
    if audio.size == 0:
        return {
            "has_speech": False,
            "rms": 0.0,
            "peak": 0.0,
            "speech_ratio": 0.0,
        }

    rms = float(np.sqrt(np.mean(audio ** 2)))
    peak = float(np.max(np.abs(audio)))

    intervals = librosa.effects.split(audio, top_db=28)

    speech_samples = sum(
        max(0, int(end) - int(start))
        for start, end in intervals
    )

    speech_ratio = speech_samples / len(audio)

    return {
        "has_speech": (
            rms > 0.012
            and peak > 0.04
            and speech_ratio > 0.18
        ),
        "rms": rms,
        "peak": peak,
        "speech_ratio": speech_ratio,
    }