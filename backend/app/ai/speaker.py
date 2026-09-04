import numpy as np
import torch
from speechbrain.inference.speaker import EncoderClassifier


class SpeakerVerifier:
    def __init__(self):
        self.classifier = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            run_opts={
                "device": (
                    "cuda"
                    if torch.cuda.is_available()
                    else "cpu"
                )
            },
        )

    def embedding(self, audio: np.ndarray, sample_rate: int):
        signal = torch.tensor(audio, dtype=torch.float32).unsqueeze(0)

        embedding = self.classifier.encode_batch(signal)

        return embedding.squeeze().detach().cpu().numpy()


def cosine_similarity(a, b) -> float:
    denominator = (
        np.linalg.norm(a)
        * np.linalg.norm(b)
    )

    if denominator == 0:
        return 0.0

    return float(
        np.dot(a, b) / denominator
    )