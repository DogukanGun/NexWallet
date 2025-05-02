from langgraph.graph.graph import CompiledGraph
from typing import Callable, Dict

from llm.cdp.agent_factory import initialize_cdp_agent


def get_ethereum_agent(on_transaction_sign: Callable[[str], None],smart_wallet_address:str) -> [CompiledGraph,Dict[str,str]]:
    return initialize_cdp_agent(on_transaction_sign,smart_wallet_address,"1")
