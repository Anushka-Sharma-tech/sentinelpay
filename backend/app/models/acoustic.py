import numpy as np
import torch

from transformers import (
    AutoFeatureExtractor,
    AutoModelForAudioClassification,
)


class AcousticDetector:
    def __init__(self, model_name: str):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.feature_extractor = (
            AutoFeatureExtractor.from_pretrained(model_name)
        )

        self.model = (
            AutoModelForAudioClassification
            .from_pretrained(model_name)
            .to(self.device)
        )

        self.model.eval()

        self.fake_index = self._find_fake_index()

    def _find_fake_index(self) -> int:
        labels = getattr(
            self.model.config,
            "id2label",
            {},
        )

        for idx, label in labels.items():
            label_text = str(label).lower()

            if label_text in {
                "fake",
                "spoof",
                "spoofed",
                "generated",
                "deepfake",
            }:
                return int(idx)

        return 0

    @torch.inference_mode()
    def predict(self, audio: np.ndarray, sample_rate: int) -> float:
        audio = np.asarray(audio, dtype=np.float32)

        minimum = int(sample_rate * 2.5)
        maximum = int(sample_rate * 8)

        if len(audio) < minimum:
            audio = np.pad(
                audio,
                (0, minimum - len(audio)),
            )

        audio = audio[:maximum]

        inputs = self.feature_extractor(
            audio,
            sampling_rate=sample_rate,
            return_tensors="pt",
            padding=True,
        )

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }

        logits = self.model(**inputs).logits
        probabilities = torch.softmax(logits, dim=-1)[0]

        return float(
            probabilities[self.fake_index].item()
        )