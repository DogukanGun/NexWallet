from pydantic import BaseModel


class AgentRequest(BaseModel):
    message: str
    wallet_address:str

class AgentResponse(BaseModel):
    response: str