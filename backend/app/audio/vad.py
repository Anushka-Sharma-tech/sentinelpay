from __future__ import annotations

import numpy as np


def detect_speech(
    waveform: np.ndarray,
    sample_rate: int,
    frame_ms: int = 30,
    hop_ms: int = 15,
    energy_threshold: float = 0.01,
) -> np.ndarray:

    frame_length = max(1, int(sample_rate * frame_ms / 1000))
    hop_length = max(1, int(sample_rate * hop_ms / 1000))

    if len(waveform) < frame_length:
        return waveform

    frames = []

    for start in range(0, len(waveform) - frame_length + 1, hop_length):
        frame = waveform[start:start + frame_length]

        rms = float(np.sqrt(np.mean(frame ** 2)))

        if rms >= energy_threshold:
            frames.append(frame)

    if not frames:
        return np.empty(0, dtype=np.float32)

    return np.concatenate(frames).astype(np.float32)