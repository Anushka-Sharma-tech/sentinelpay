import numpy as np
import librosa


def extract_prosody_features(
    audio: np.ndarray,
    sample_rate: int,
) -> dict:

    pitches, voiced_flag, _ = librosa.pyin(
        audio,
        fmin=librosa.note_to_hz("C2"),
        fmax=librosa.note_to_hz("C7"),
        sr=sample_rate,
    )

    voiced = pitches[~np.isnan(pitches)]

    if len(voiced) < 8:
        return {
            "pitch_std": 0.0,
            "pitch_jump": 0.0,
            "prosody_score": 0.0,
        }

    pitch_std = float(np.std(voiced))

    pitch_jump = float(
        np.mean(np.abs(np.diff(voiced)))
        / max(1.0, np.mean(voiced))
    )

    score = (
        (pitch_std / 180.0) * 0.45
        + pitch_jump * 1.4
    )

    return {
        "pitch_std": pitch_std,
        "pitch_jump": pitch_jump,
        "prosody_score": float(np.clip(score, 0, 1)),
    }