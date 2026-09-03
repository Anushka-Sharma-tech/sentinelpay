import time

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.dependencies import require_user
from app.models.acoustic import AcousticDetector
from app.models.speaker import SpeakerVerifier
from app.services.analyzer import SentinelAnalyzer
from app.services.transcription import Transcriber


router = APIRouter(
    prefix="/api/v1",
    tags=["analysis"],
)


# ---------------------------------------------------------
# Model configuration
# ---------------------------------------------------------

ACOUSTIC_MODEL = "MIT/ast-finetuned-audioset-10-10-0.4593"

ASR_MODEL = "openai/whisper-small"


# ---------------------------------------------------------
# Create analyzer
# ---------------------------------------------------------

acoustic_detector = AcousticDetector(
    ACOUSTIC_MODEL
)

speaker_verifier = SpeakerVerifier()

transcriber = Transcriber(
    ASR_MODEL
)

analyzer = SentinelAnalyzer(
    acoustic_detector=acoustic_detector,
    speaker_verifier=speaker_verifier,
    transcriber=transcriber,
    model_version="baseline-v1",
)


# ---------------------------------------------------------
# Analysis endpoint
# ---------------------------------------------------------

@router.post("/analyze-audio")
async def analyze_audio(
    audio: UploadFile = File(...),
    user=Depends(require_user),
):
    started = time.perf_counter()

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="Audio file is empty.",
        )

    if len(audio_bytes) > 2_000_000:
        raise HTTPException(
            status_code=413,
            detail="Audio file is too large.",
        )

    try:
        result = analyzer.analyze(
            audio_bytes=audio_bytes,
            transaction_context={},
            session_context={},
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Audio analysis failed.",
        ) from exc

    return result.model_dump()