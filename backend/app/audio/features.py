from __future__ import annotations

import numpy as np
import librosa


def extract_audio_features(
    waveform: np.ndarray,
    sample_rate: int,
) -> dict[str, float]:

    if waveform.size == 0:
        raise ValueError("Cannot extract features from empty waveform.")

    rms = librosa.feature.rms(y=waveform)[0]

    spectral_centroid = librosa.feature.spectral_centroid(
        y=waveform,
        sr=sample_rate,
    )[0]

    spectral_bandwidth = librosa.feature.spectral_bandwidth(
        y=waveform,
        sr=sample_rate,
    )[0]

    zero_crossing_rate = librosa.feature.zero_crossing_rate(
        waveform
    )[0]

    return {
        "rms_mean": float(np.mean(rms)),
        "rms_std": float(np.std(rms)),
        "spectral_centroid_mean": float(np.mean(spectral_centroid)),
        "spectral_centroid_std": float(np.std(spectral_centroid)),
        "spectral_bandwidth_mean": float(np.mean(spectral_bandwidth)),
        "zero_crossing_rate_mean": float(np.mean(zero_crossing_rate)),
        "duration_seconds": float(len(waveform) / sample_rate),
    }