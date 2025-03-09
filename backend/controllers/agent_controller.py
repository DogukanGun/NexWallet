from fastapi import APIRouter, HTTPException
from controllers.request_models.agent_models import AgentRequest, AgentResponse
from llm.decision_maker import LangChainAgent
from llm.decision_maker.tools.utils import process_agent_stream

router = APIRouter(tags=["Agent"], prefix="/agent")

#TODO if the user doesn't pay or authenticate endpoint must return error
@router.post("/chat",response_model=AgentResponse)
async def ask_agent(agent_request: AgentRequest):
    try:
        bot = LangChainAgent()
        response = process_agent_stream(bot.agent, bot.config, agent_request.message
                                        + f"\nUser wallet address:{agent_request.wallet_address}")
        return AgentResponse(response=response)
    except Exception as e:
        print(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))
