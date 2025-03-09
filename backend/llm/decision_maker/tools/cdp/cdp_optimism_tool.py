from typing import Type

from langchain_core.tools import BaseTool
from pydantic import BaseModel

from llm.cdp.cdp_optimism.agent import get_optimism_agent
from llm.decision_maker.tools.model import CdpToolParams
from llm.decision_maker.tools.utils import process_agent_stream


class CdpOptimismTool(BaseTool):
    name:str = "CDP_Optimism_Agent_Tool"
    description:str = "Whenever an user request is made about Optimism Blockchain, use this tool"
    args_schema: Type[BaseModel] = CdpToolParams

    def _run(self, user_input: str, user_wallet: str) -> str:
        signature_result = ""

        def handle_signature(signature: str):
            nonlocal signature_result
            signature_result = signature
            print(f"Transaction signed with signature: {signature}")

        agent, config = get_optimism_agent(
            on_transaction_sign=lambda signature: handle_signature(signature),
            smart_wallet_address=user_wallet
        )

        temp_signature_result = process_agent_stream(agent, config, user_input)
        if temp_signature_result != "":
            signature_result = temp_signature_result

        return signature_result
