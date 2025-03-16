from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from controllers.request_models.admin_models import CreateChainRequest, CreateKnowledgeBaseRequest, CreateLLMProviderRequest
from models.chain import Chain, KnowledgeBase, LlmProvider, agent_chain, Agents
from utils.database import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])


# TODO here: Implement method to authenticate admin login, validate credentials and generate JWT.
# TODO Frontend app has a message checking for web3 wallet, handle that operation here

@router.post("/chain")
async def add_chain(
    request: CreateChainRequest,
    db: Session = Depends(get_db)
):
    try:
        chain = Chain(
            id=str(uuid.uuid4()),
            icon=request.icon,
            is_embedded=request.is_embedded,
            name=request.name,
            disabled=request.disabled
        )
        db.add(chain)
        db.commit()
        db.refresh(chain)
        return chain
    except Exception as e:
        print(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/chain/{chain_id}")
async def delete_chain(
    chain_id: str,
    db: Session = Depends(get_db)
):
    chain = db.query(Chain).filter(Chain.id == chain_id).first()
    if chain is None:
        return {"message": "Chain not found"}
    
    db.delete(chain)
    db.commit()
    return {"message": "Chain and associated agents deleted successfully"}

@router.get("/chain")
async def get_chains(
    db: Session = Depends(get_db)
):
    chains = db.query(Chain).all()
    return chains

@router.put("/chain/disable/{chain_id}")
async def get_chain(
    chain_id: str,
    db: Session = Depends(get_db)
):
    chain = db.query(Chain).filter(Chain.id == chain_id).first()
    if chain is None:
        return {"message": "Chain not found"}
    chain.disabled = True
    db.commit()
    return {"message": "Chain disabled successfully"}

@router.put("/chain/enable/{chain_id}")
async def get_chain(
    chain_id: str,
    db: Session = Depends(get_db)
):
    chain = db.query(Chain).filter(Chain.id == chain_id).first()
    if chain is None:
        return {"message": "Chain not found"}
    chain.disabled = False
    db.commit()
    return {"message": "Chain enabled successfully"}

@router.post("/kb")
async def add_knowledge_base(
    request: CreateKnowledgeBaseRequest,
    db: Session = Depends(get_db)
):
    kb = KnowledgeBase(id=str(uuid.uuid4()),name=request.name,disabled=request.disabled)
    db.add(kb)
    db.commit()
    db.refresh(kb)
    return kb

@router.delete("/kb/{kb_id}")
async def delete_knowledge_base(
    kb_id: str,
    db: Session = Depends(get_db)
):
    kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == kb_id).first()
    if kb is None:
        return {"message": "Knowledge base not found"}
    db.delete(kb)
    db.commit()
    return {"message": "Knowledge base deleted successfully"}

@router.get("/kb")
async def get_knowledge_bases(
    db: Session = Depends(get_db)
):
    kbs = db.query(KnowledgeBase).all()
    return kbs

@router.put("/kb/disable/{kb_id}")
async def get_knowledge_base(
    kb_id: str,
    db: Session = Depends(get_db)
):
    db.query(KnowledgeBase).filter(KnowledgeBase.id == kb_id).update({"disabled": True})
    db.commit()
    return {"message": "Knowledge base disabled successfully"}

@router.put("/kb/enable/{kb_id}")
async def get_knowledge_base(
    kb_id: str,
    db: Session = Depends(get_db)
):
    db.query(KnowledgeBase).filter(KnowledgeBase.id == kb_id).update({"disabled": False})
    db.commit()
    return {"message": "Knowledge base enabled successfully"}

@router.post("/llm-providers")
async def add_llm_provider(
    request: CreateLLMProviderRequest,
    db: Session = Depends(get_db)
):
    provider = LlmProvider(id=str(uuid.uuid4()),name=request.name, disabled=request.disabled)
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider

@router.delete("/llm-providers/{provider_id}")
async def delete_llm_provider(
    provider_id: str,
    db: Session = Depends(get_db)
):
    provider = db.query(LlmProvider).filter(LlmProvider.id == provider_id).first()
    if provider is None:
        return {"message": "LLM Provider not found"}
    db.delete(provider)
    db.commit()
    return {"message": "LLM Provider deleted successfully"}

@router.get("/llm-providers")
async def get_llm_providers(
    db: Session = Depends(get_db)
):
    providers = db.query(LlmProvider).all()
    return providers

@router.put("/llm-providers/disable/{provider_id}")
async def disable_llm_provider(
    provider_id: str,
    db: Session = Depends(get_db)
):
    provider = db.query(LlmProvider).filter(LlmProvider.id == provider_id).first()
    if provider is None:
        return {"message": "LLM Provider not found"}
    provider.disabled = True
    db.commit()
    return {"message": "LLM Provider disabled successfully"}

@router.put("/llm-providers/enable/{provider_id}")
async def enable_llm_provider(
    provider_id: str,
    db: Session = Depends(get_db)
):
    provider = db.query(LlmProvider).filter(LlmProvider.id == provider_id).first()
    if provider is None:
        return {"message": "LLM Provider not found"}
    provider.disabled = False
    db.commit()
    return {"message": "LLM Provider enabled successfully"}



