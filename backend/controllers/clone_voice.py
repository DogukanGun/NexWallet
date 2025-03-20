from fastapi import APIRouter, Depends, HTTPException
import torch
from TTS.api import TTS

from controllers.request_models.voice_models import VoiceRequest

router = APIRouter(prefix="/voice", tags=["Clone Voice"])

@router.post("/clone")
async def clone_voice(
    request: VoiceRequest,
):
    try:
        tts = TTS(request["model_name"])
        tts.clone_voice(request["source_voice_id"], request["target_voice_id"])
        return {"message": "Voice cloned successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))