from pydantic import BaseModel, Field


class CdpToolParams(BaseModel):
    user_input: str = Field(description="User request to be answered")
    user_wallet: str = Field(description="User wallet address")

class SwapToolParams(BaseModel):
    input_currency: str =  Field(description="Input currency")
    output_currency: str = Field(description="Output currency")
    amount: int = Field(description="Amount to swap")
    max_slippage: float = Field(description="Max slippage")
    sender: str = Field(description="Sender wallet address")