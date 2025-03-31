import uuid
from base64 import b64encode

from fastapi import APIRouter, File, Depends, HTTPException, UploadFile, Form
import torch
from TTS.api import TTS
from TTS.tts.configs.xtts_config import XttsArgs,XttsConfig,XttsAudioConfig
from TTS.config.shared_configs import BaseDatasetConfig
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse
from typing import Optional

from controllers.request_models.voice_models import VoiceRequest, VoiceGenerateRequest
import os
from middleware.with_admin import verify_admin
from models.user import Voices
from utils.database import get_db

torch.serialization.add_safe_globals([XttsConfig])
torch.serialization.add_safe_globals([XttsAudioConfig])
torch.serialization.add_safe_globals([XttsArgs])
torch.serialization.add_safe_globals([BaseDatasetConfig])

router = APIRouter(prefix="/voice", tags=["Clone Voice"])

@router.post("/clone")
async def clone_voice(
    audio_file: UploadFile = File(...),
    share_for_training: Optional[bool] = Form(False),
    admin_payload: dict = Depends(verify_admin),
    db: Session = Depends(get_db),
):
    try:
        if not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Please upload an audio file."
            )
            
        content = await audio_file.read()
        user_voice_data = Voices(
            voice_id=str(uuid.uuid4()),
            voice_bytes=content,
            share_for_training=share_for_training,
            user_id=admin_payload['user_id']
        )
        db.add(user_voice_data)
        db.commit()
        db.refresh(user_voice_data)

        return {"message": "Voice cloned successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my")
async def get_my_voices(
    admin_payload: dict = Depends(verify_admin),
    db: Session = Depends(get_db),
):
    try:
        user_voices = db.query(Voices).filter(Voices.user_id == admin_payload['user_id']).all()
        
        # Prepare the response data, excluding binary data or encoding it
        response_data = [
            {
                "voice_id": voice.voice_id,
                "share_for_training": voice.share_for_training,
                "user_id": voice.user_id,
                # Ensure that voice_bytes is accessed correctly and encoded
                "voice_bytes": b64encode(voice.voice_bytes).decode('utf-8') if voice.voice_bytes else None
            }
            for voice in user_voices
        ]
        
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/synthesize")
async def generate_voice(
    voice_request: VoiceGenerateRequest,
    admin_payload: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    temp_voice_path = None
    output_path = None
    
    try:
        # Get the user's voice from the database
        user_voice = db.query(Voices).filter(
            Voices.user_id == admin_payload['user_id'],
            Voices.voice_id == voice_request.voice_id
        ).first()
        
        if not user_voice:
            raise HTTPException(status_code=404, detail="Voice not found")

        # Create temporary file paths with absolute paths
        import tempfile
        
        # Create temporary files with unique names
        temp_voice_fd, temp_voice_path = tempfile.mkstemp(suffix='.wav')
        output_fd, output_path = tempfile.mkstemp(suffix='.wav')
        
        # Close the file descriptors
        os.close(temp_voice_fd)
        os.close(output_fd)

        # Write voice bytes to temporary file
        with open(temp_voice_path, "wb") as f:
            f.write(user_voice.voice_bytes)

        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Initialize TTS
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

        # Generate audio
        tts.tts_to_file(
            text=voice_request.text,
            speaker_wav=temp_voice_path,
            language="en",
            file_path=output_path
        )

        # Verify the output file exists and has content
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise HTTPException(status_code=500, detail="Failed to generate audio file")

        # Read the file and stream it
        with open(output_path, "rb") as f:
            audio_data = f.read()

        return StreamingResponse(
            iter([audio_data]),
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=response.wav"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up temporary files
        for file_path in [temp_voice_path, output_path]:
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass