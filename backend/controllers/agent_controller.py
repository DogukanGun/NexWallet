import uuid

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload

from controllers.request_models.agent_models import AgentRequest, AgentResponse, SaveAgentRequest
from llm.decision_maker import LangChainAgent
from llm.decision_maker.tools.utils import process_agent_stream
from middleware.withAdmin import verify_admin
from models import TwitterUsers,KnowledgeBase, LlmProvider, Chain, Agents, AuthPayload
from utils.database import get_db

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


@router.post("/save")
async def save_agent(
        save_agent_request: SaveAgentRequest,
        admin_payload: dict = Depends(verify_admin),
        db: Session = Depends(get_db)
):
    # Fetch knowledge bases
    knowledge_bases = [db.query(KnowledgeBase).filter(KnowledgeBase.name == knowledge_base).first() for knowledge_base in save_agent_request.knowledge_bases]
    # Fetch LLM provider
    llm_provider = db.query(LlmProvider).filter(LlmProvider.name == save_agent_request.llm_provider).first()
    # Fetch chains
    chains = [db.query(Chain).filter(Chain.name == chain).first() for chain in save_agent_request.chains]
    # Fetch user
    payload = AuthPayload(**admin_payload)
    user = db.query(TwitterUsers).filter(TwitterUsers.user_id == payload.user_id).first()
    if any(kb is None for kb in knowledge_bases) and len(save_agent_request.knowledge_bases) > 0:
        raise HTTPException(status_code=400, detail="Invalid knowledge base ID")
    if llm_provider is None:
        raise HTTPException(status_code=400, detail="Invalid LLM provider ID")
    if any(ch is None for ch in chains):
        raise HTTPException(status_code=400, detail="Invalid chain ID")
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Create the agent instance
    agent = Agents(
        id=str(uuid.uuid4()),
        name=save_agent_request.name,
        description=save_agent_request.description,
        is_on_point_system=False,
    )

    agent.knowledge_bases = knowledge_bases
    agent.llm_providers = [llm_provider]
    agent.chains = chains
    agent.user = user

    db.add(agent)
    db.commit()
    db.refresh(agent)  # Refresh to get the updated instance with ID

    return AgentResponse(response=f"Agent {agent.name} saved successfully.")

@router.get("/my")
async def get_my_agents(
        db: Session = Depends(get_db),
        admin_payload: dict = Depends(verify_admin)
):
    payload = AuthPayload(**admin_payload)
    user = db.query(TwitterUsers).filter(TwitterUsers.user_id == str(payload.user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Users not found")
    
    # Update the query to include related llm_providers and chains
    agents = db.query(Agents).options(joinedload(Agents.llm_providers), joinedload(Agents.chains)).filter(Agents.user_id == user.id).all()
    return agents

@router.get("/my/{agent_id}")
async def get_my_agent(
        agent_id: str,
        db: Session = Depends(get_db),
        admin_payload: dict = Depends(verify_admin)
):
    payload = AuthPayload(**admin_payload)
    users = db.query(Agents).filter(Agents.user_id == payload.user_id).all()
    if len(users) == 0:
        raise HTTPException(status_code=404, detail="Users not found")
    if len(users) > 1:
        raise HTTPException(status_code=500, detail="More than 1 user found")
    agents = db.query(Agents).filter(Agents.user_id == payload.user_id and Agents.id == agent_id).all()
    if len(agents) == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    if len(agents) > 1:
        raise HTTPException(status_code=500, detail="More than 1 agent found")
    return agents[0]
