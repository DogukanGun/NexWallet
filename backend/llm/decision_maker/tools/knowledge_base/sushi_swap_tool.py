from typing import Type

from langchain_core.tools import BaseTool
from pydantic import BaseModel
import requests

from llm.decision_maker.tools.model import SwapToolParams


class CdpSushiSwapTool(BaseTool):
    name: str = "CDP_SushiSwap_Tool"
    description: str = "Whenever a user requests a token swap on the SushiSwap API, use this tool."
    args_schema: Type[BaseModel] = SwapToolParams

    def _run(self, input_currency: str, output_currency: str, amount: int, max_slippage: float, sender: str) -> dict:
        chain_id = 204  # opBNB chain ID
        swap_api_url = f"https://api.sushi.com/swap/v6/{chain_id}"

        params = {
            "tokenIn": input_currency,
            "tokenOut": output_currency,
            "amount": str(amount),
            "maxSlippage": str(max_slippage),
            "sender": sender,
        }

        response = requests.get(swap_api_url, params=params)
        data = response.json()

        if data.get("status") == "Success":
            tx = data.get("tx", {})
            return {
                "data": tx.get("data"),
                "to": tx.get("to"),
                "value": tx.get("value"),
            }

        return {"error": "Swap request failed.", "response": data}
