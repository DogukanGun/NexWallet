from coinbase_agentkit_langchain import get_langchain_tools
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.graph import CompiledGraph
from langgraph.prebuilt import create_react_agent
from typing import Callable, Dict

from llm.cdp.coinbase_agentkit import AgentKit, AgentKitConfig, cdp_api_action_provider, weth_action_provider, \
    wallet_action_provider, pyth_action_provider, erc20_action_provider, cdp_wallet_action_provider
from llm.cdp.coinbase_agentkit import EthAccountWalletProvider, EthAccountWalletProviderConfig

def initialize_cdp_agent(on_transaction_sign: Callable[[str], None],smart_wallet_address:str,chain_id:str) -> \
        [CompiledGraph,Dict[str,str]]:
    """Initialize the agent with CDP Agentkit."""
    # Initialize LLM
    llm = ChatOpenAI(model="gpt-4o-mini")

    # Create the wallet provider configuration with the on_transaction_sign callback
    cdp_config = EthAccountWalletProviderConfig(
        chain_id=chain_id,
        smart_wallet_address = smart_wallet_address,
        on_transaction_sign=on_transaction_sign
    )

    wallet_provider = EthAccountWalletProvider(cdp_config)

    agentkit = AgentKit(AgentKitConfig(
        wallet_provider=wallet_provider,
        action_providers=[
            cdp_api_action_provider(),
            cdp_wallet_action_provider(),
            erc20_action_provider(),
            pyth_action_provider(),
            wallet_action_provider(),
            weth_action_provider(),
        ]
    ))
    # use get_langchain_tools
    tools = get_langchain_tools(agentkit)

    # Store buffered conversation history in memory.
    memory = MemorySaver()
    config = {
        "configurable": {
            "thread_id": "CDP Agentkit Chatbot Example!",
            "checkpoint_ns": "default_ns",  # Add a default namespace
            "checkpoint_id": "default_id"   # Add a default checkpoint ID
        }
    }

    # Create ReAct Agent using the LLM and CDP Agentkit tools.
    react_agent = create_react_agent(
        llm,
        tools=tools,
        checkpointer=memory,
        state_modifier=(
            "You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. "
            "You are empowered to interact onchain using your tools. If you ever need funds, you can request "
            "them from the faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet "
            "details and request funds from the user. Before executing your first action, get the wallet details "
            "to see what network you're on. If there is a 5XX (internal) HTTP error code, ask the user to try "
            "again later. If someone asks you to do something you can't do with your currently available tools, "
            "you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit, "
            "recommend they go to docs.cdp.coinbase.com for more information. Be concise and helpful with your "
            "responses. Refrain from restating your tools' descriptions unless it is explicitly requested. Additionally, "
            "If you receive only transaction parameters than return them directly without asking for any other information "
            "or saying anything else."
        ),
    )

    return react_agent,config

