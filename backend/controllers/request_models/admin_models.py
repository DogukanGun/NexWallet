from pydantic import BaseModel


class CreateChainRequest(BaseModel):
    name: str
    is_embedded: bool
    disabled: bool
    icon: str

class CreateKnowledgeBaseRequest(BaseModel):
    name: str
    disabled: bool

class CreateLLMProviderRequest(BaseModel):
    name: str
    disabled: bool = False