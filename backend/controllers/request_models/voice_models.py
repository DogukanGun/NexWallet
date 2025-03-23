from pydantic import BaseModel


class VoiceRequest(BaseModel):
    voice: bytes

class VoiceGenerateRequest(BaseModel):
    text: str
    voice_id: str