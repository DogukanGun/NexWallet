from pydantic import BaseModel, Field


class CdpToolParams(BaseModel):
    user_input: str = Field(description="User request to be answered")
    user_wallet: str = Field(description="User wallet address")
