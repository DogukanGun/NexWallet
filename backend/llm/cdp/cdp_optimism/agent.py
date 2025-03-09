from langgraph.graph.graph import CompiledGraph
from typing import Callable, Dict

from llm.cdp.agent_factory import initialize_cdp_agent
from dotenv import load_dotenv

load_dotenv()

def get_optimism_agent(on_transaction_sign: Callable[[str], None],smart_wallet_address:str) -> [CompiledGraph,Dict[str,str]]:
    return initialize_cdp_agent(on_transaction_sign,smart_wallet_address,"10")

