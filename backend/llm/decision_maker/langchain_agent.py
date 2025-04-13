from typing import Dict

from langgraph.graph.graph import CompiledGraph
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

from .tools import CdpBaseTool, CdpArbitrumTool, CdpEthereumTool, CdpOptimismTool

class LangChainAgent:

    def create_agent(self) -> [CompiledGraph,Dict[str,str]]:
        llm = ChatOpenAI(model="gpt-4o-mini")
        config = {
            "configurable": {
                "thread_id": "CDP Agentkit Chatbot Example!",
                "checkpoint_ns": "default_ns",  # Add a default namespace
                "checkpoint_id": "default_id"  # Add a default checkpoint ID
            }
        }
        memory = MemorySaver()
        # Create ReAct Agent using the LLM and CDP Agentkit tools.
        react_agent = create_react_agent(
            llm,
            tools=[CdpBaseTool(), CdpArbitrumTool(), CdpEthereumTool(), CdpOptimismTool()],
            checkpointer=memory,
            state_modifier=(
                "You are a helpful agent that can interact onchain using the tools u have. Be concise and helpful with your responses."
                "Refrain from restating your tools' descriptions unless it is explicitly requested. Additionally, "
                "If you receive only transaction parameters than return them directly without asking for any other information"
                "or saying anything else. "
            ),
        )
        return react_agent,config

    def __init__(self):
        agent,config = self.create_agent()
        self.agent = agent
        self.config = config