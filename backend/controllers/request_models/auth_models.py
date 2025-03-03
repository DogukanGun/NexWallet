from pydantic import BaseModel


class AdminRequest(BaseModel):
    walletAddress: str
    signature: str