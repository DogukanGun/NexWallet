import contextvars
from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage

from controllers.request_models.agent_models import AgentRequest
from llm.cdp.cdp_base import initialize_cdp_base_agent

router = APIRouter(tags=["Agent"], prefix="/agent")

signature_var = contextvars.ContextVar("signature_var", default=None)

def on_transaction_sign(signature: str):
    """Callback function to handle transaction signing."""
    signature_var.set(signature)
    print(f"Transaction signed with signature: {signature}")

@router.post("/chat")
async def ask_agent(agent_request: AgentRequest):
    try:
        agent, config = initialize_cdp_base_agent(
            on_transaction_sign=on_transaction_sign,
            smart_wallet_address=agent_request.wallet_address
        )
        response = ""
        for chunk in agent.stream(
                {"messages": [HumanMessage(content=agent_request.message)]}, config
        ):
            if "agent" in chunk:
                response += chunk["agent"]["messages"][0].content + "\n"
            elif "tools" in chunk:
                print(chunk["tools"]["messages"][0].content)
            print("-------------------")
        return {
            "response": response,
            "signature": signature_var.get()  # Include the signature in the response
        }
    except Exception as e:
        print(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))
