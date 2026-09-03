import time
from typing import Any

import numpy as np

from app.audio.decoder import decode_audio
from app.audio.vad import speech_activity
from app.models.acoustic import AcousticDetector
from app.models.behaviour import calculate_behaviour_risk
from app.models.context import analyze_text
from app.models.prosody import extract_prosody_features
from app.models.speaker import SpeakerVerifier, cosine_similarity
from app.models.transaction import calculate_transaction_risk
from app.risk.explanations import generate_explanations
from app.risk.fusion import FusionInput, fuse
from app.risk.policy import decide
from app.services.transcription import Transcriber
from app.schemas.risk import RiskResult, SignalScores, RiskFactor


class SentinelAnalyzer:
    def __init__(
        self,
        acoustic_detector: AcousticDetector,
        speaker_verifier: SpeakerVerifier,
        transcriber: Transcriber,
        model_version: str = "baseline-v1",
    ):
        self.acoustic_detector = acoustic_detector
        self.speaker_verifier = speaker_verifier
        self.transcriber = transcriber
        self.model_version = model_version

    def analyze(
        self,
        audio_bytes: bytes,
        transaction_context: dict[str, Any],
        session_context: dict[str, Any],
    ) -> RiskResult:

        started = time.perf_counter()

        # ---------------------------------------------------------
        # 1. Decode audio
        # ---------------------------------------------------------

        samples, sample_rate = decode_audio(audio_bytes)

        # ---------------------------------------------------------
        # 2. Voice activity detection
        # ---------------------------------------------------------

        activity = speech_activity(samples)

        if not activity["has_speech"]:
            latency_ms = (time.perf_counter() - started) * 1000

            return RiskResult(
                risk_score=0.0,
                risk_level="LOW",
                decision="ALLOW",
                signals=SignalScores(
                    acoustic=0.0,
                    prosody=0.0,
                    speaker=0.0,
                    context=0.0,
                    behaviour=0.0,
                    transaction=0.0,
                ),
                factors=[],
                explanations=["No meaningful speech was detected."],
                model_version=self.model_version,
                latency_ms=latency_ms,
            )

        # ---------------------------------------------------------
        # 3. Acoustic analysis
        # ---------------------------------------------------------

        acoustic_score = self.acoustic_detector.predict(
            samples,
            sample_rate,
        )

        # ---------------------------------------------------------
        # 4. Prosody analysis
        # ---------------------------------------------------------

        prosody_result = extract_prosody_features(
            samples,
            sample_rate,
        )

        prosody_score = float(
            prosody_result.get("prosody_score", 0.0)
        )

        # ---------------------------------------------------------
        # 5. Speaker analysis
        # ---------------------------------------------------------

        current_embedding = self.speaker_verifier.embedding(
            samples,
            sample_rate,
        )

        speaker_baseline = session_context.get(
            "speaker_baseline"
        )

        if speaker_baseline is not None:
            baseline_embedding = np.asarray(
                speaker_baseline,
                dtype=np.float32,
            )

            similarity = cosine_similarity(
                current_embedding,
                baseline_embedding,
            )

            # Convert similarity into mismatch risk.
            speaker_score = float(
                np.clip(1.0 - similarity, 0.0, 1.0)
            )
        else:
            # No baseline means we cannot claim speaker mismatch.
            # Use neutral score instead of inventing evidence.
            speaker_score = 0.5

        # ---------------------------------------------------------
        # 6. Speech-to-text
        # ---------------------------------------------------------

        transcript = self.transcriber.transcribe(
            samples,
            sample_rate,
        )

        # ---------------------------------------------------------
        # 7. Context analysis
        # ---------------------------------------------------------

        context_result = analyze_text(transcript)

        context_score = float(
            context_result.get("score", 0.0)
        )

        triggers = context_result.get(
            "triggers",
            [],
        )

        # ---------------------------------------------------------
        # 8. Transaction analysis
        # ---------------------------------------------------------

        transaction_result = calculate_transaction_risk(
            amount=float(
                transaction_context.get(
                    "amount",
                    0.0,
                )
            ),
            historical_average=float(
                transaction_context.get(
                    "historical_average",
                    0.0,
                )
            ),
            is_new_recipient=bool(
                transaction_context.get(
                    "is_new_recipient",
                    False,
                )
            ),
            recent_transaction_count=int(
                transaction_context.get(
                    "recent_transaction_count",
                    0,
                )
            ),
        )

        transaction_score = float(
            transaction_result.get(
                "score",
                0.0,
            )
        )

        # ---------------------------------------------------------
        # 9. Behaviour analysis
        # ---------------------------------------------------------

        behaviour_score = calculate_behaviour_risk(
            failed_attempts=int(
                session_context.get(
                    "failed_attempts",
                    0,
                )
            ),
            retry_count=int(
                session_context.get(
                    "retry_count",
                    0,
                )
            ),
            minutes_since_previous_transaction=float(
                session_context.get(
                    "minutes_since_previous_transaction",
                    60.0,
                )
            ),
        )

        # ---------------------------------------------------------
        # 10. Risk fusion
        # ---------------------------------------------------------

        fusion_input = FusionInput(
            acoustic=acoustic_score,
            prosody=prosody_score,
            speaker=speaker_score,
            context=context_score,
            behaviour=behaviour_score,
            transaction=transaction_score,
        )

        fused_risk = fuse(fusion_input)

        # ---------------------------------------------------------
        # 11. Decision
        # ---------------------------------------------------------

        decision, risk_level = decide(
            fused_risk
        )

        # Convert 0-1 score to 0-100 score
        risk_score_100 = fused_risk * 100.0

        # ---------------------------------------------------------
        # 12. Explanations
        # ---------------------------------------------------------

        explanations = generate_explanations(
            triggers=triggers,
            transaction_risk=transaction_result,
            acoustic=acoustic_score,
            speaker=speaker_score,
        )

        # Add a generic explanation if none were generated.
        if not explanations:
            explanations.append(
                "No major predefined risk indicators were detected."
            )

        # ---------------------------------------------------------
        # 13. Risk factors
        # ---------------------------------------------------------

        factors = [
            RiskFactor(
                factor_type="signal",
                factor_name="acoustic",
                contribution=acoustic_score,
                evidence={
                    "score": acoustic_score,
                },
            ),
            RiskFactor(
                factor_type="signal",
                factor_name="prosody",
                contribution=prosody_score,
                evidence=prosody_result,
            ),
            RiskFactor(
                factor_type="signal",
                factor_name="speaker",
                contribution=speaker_score,
                evidence={
                    "baseline_available": (
                        speaker_baseline is not None
                    ),
                },
            ),
            RiskFactor(
                factor_type="signal",
                factor_name="context",
                contribution=context_score,
                evidence={
                    "triggers": triggers,
                    "transcript": transcript,
                },
            ),
            RiskFactor(
                factor_type="signal",
                factor_name="transaction",
                contribution=transaction_score,
                evidence=transaction_result,
            ),
            RiskFactor(
                factor_type="signal",
                factor_name="behaviour",
                contribution=behaviour_score,
                evidence={
                    "failed_attempts": session_context.get(
                        "failed_attempts",
                        0,
                    ),
                    "retry_count": session_context.get(
                        "retry_count",
                        0,
                    ),
                },
            ),
        ]

        # ---------------------------------------------------------
        # 14. Final response
        # ---------------------------------------------------------

        latency_ms = (
            time.perf_counter() - started
        ) * 1000

        return RiskResult(
            risk_score=risk_score_100,
            risk_level=risk_level,
            decision=decision,
            signals=SignalScores(
                acoustic=acoustic_score,
                prosody=prosody_score,
                speaker=speaker_score,
                context=context_score,
                behaviour=behaviour_score,
                transaction=transaction_score,
            ),
            factors=factors,
            explanations=explanations,
            model_version=self.model_version,
            latency_ms=latency_ms,
        )