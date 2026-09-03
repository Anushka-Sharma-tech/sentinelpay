import numpy as np
import torch
from transformers import pipeline


class Transcriber:
    def __init__(self, model_name: str):
        self.pipe = pipeline(
            "automatic-speech-recognition",
            model=model_name,
            device=0 if torch.cuda.is_available() else -1,
        )

    def transcribe(
        self,
        audio: np.ndarray,
        sample_rate: int,
    ) -> str:

        result = self.pipe(
            {
                "raw": audio,
                "sampling_rate": sample_rate,
            }
        )

        return result["text"].strip()