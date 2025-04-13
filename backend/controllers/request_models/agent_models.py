from typing import List

from pydantic import BaseModel


class AgentRequest(BaseModel):
    message: str
    wallet_address:str

class AgentResponse(BaseModel):
    response: str

class SaveAgentRequest(BaseModel):
    name: str
    description: str
    llm_provider: str
    chains: List[str]
    knowledge_bases: List[str]