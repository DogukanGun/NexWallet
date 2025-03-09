from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Transaction(Base):
    __tablename__ = 'Transactions'
    id = Column(Integer, primary_key=True, index=True)
    transaction_hash = Column(String, unique=True, index=True)
    user_wallet = Column(String, index=True)
    created_at = Column(DateTime, server_default=func.now())

class Chain(Base):
    __tablename__ = 'Chains'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    is_embedded = Column(Boolean, default=False)
    disabled = Column(Boolean, default=False)
    icon = Column(String)

class LlmProvider(Base):
    __tablename__ = 'LlmProviders'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    disabled = Column(Boolean, default=False)

class KnowledgeBase(Base):
    __tablename__ = 'KnowledgeBases'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    disabled = Column(Boolean, default=False)

class Agent(Base):
    __tablename__ = 'Agents'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    is_on_point_system = Column(Boolean, default=False)

class AgentPoint(Base):
    __tablename__ = 'AgentPoints'
    id = Column(String, primary_key=True, index=True)
    agent_id = Column(String, index=True)
    points = Column(Integer)
