from sqlalchemy import Column, Integer, String, DateTime, Boolean, Table, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

agent_chain = Table('agent_chain', Base.metadata,
    Column('agent_id', String, ForeignKey('Agents.id'), primary_key=True),
    Column('chain_id', String, ForeignKey('Chains.id'), primary_key=True)
)
agent_knowledge_base = Table('agent_knowledge_base', Base.metadata,
    Column('agent_id', String, ForeignKey('Agents.id'), primary_key=True),
    Column('knowledge_base_id', String, ForeignKey('KnowledgeBases.id'), primary_key=True)
)
agent_llm_provider = Table('agent_llm_provider', Base.metadata,
    Column('agent_id', String, ForeignKey('Agents.id'), primary_key=True),
    Column('llm_provider_id', String, ForeignKey('LlmProviders.id'), primary_key=True)
)
agent_user = Table('agent_user', Base.metadata,
    Column('agent_id', String, ForeignKey('Agents.id'), primary_key=True),
    Column('user_id', String, ForeignKey('TwitterUser.id'), primary_key=True)
)


class TwitterUsers(Base):
    __tablename__ = 'TwitterUsers'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    username = Column(String)
    name = Column(String)
    agents = relationship('Agents', back_populates='user')

class RegisteredUser(Base):
    __tablename__ = 'RegisteredUsers'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)

class SpecialUserCode(Base):
    __tablename__ = 'SpecialUserCodes'
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, index=True)
    is_used = Column(Boolean, default=False)
    used_by = Column(String, index=True)

class UserWallet(Base):
    __tablename__ = 'UserWallet'
    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String, unique=True, index=True)
    is_verified = Column(Boolean, default=False)
    user_id = Column(String, index=True)

class Admin(Base):
    __tablename__ = 'Admins'
    user_id = Column(String, primary_key=True, index=True)

class Interaction(Base):
    __tablename__ = 'Interations'
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    page = Column(String)

class WalletInteraction(Base):
    __tablename__ = 'WalletInteraction'
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    operation = Column(String)
    success = Column(Boolean, default=False)

class Transaction(Base):
    __tablename__ = 'Transactions'
    id = Column(Integer, primary_key=True, index=True)
    transaction_hash = Column(String, unique=True, index=True)
    user_wallet = Column(String, index=True,name="userWallet")
    created_at = Column(DateTime, server_default=func.now())

class Chain(Base):
    __tablename__ = 'Chains'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    is_embedded = Column(Boolean, default=False, name="isEmbedded")
    disabled = Column(Boolean, default=False)
    icon = Column(String)
    agents = relationship('Agents', secondary=agent_chain, back_populates='chains')

class LlmProvider(Base):
    __tablename__ = 'LlmProviders'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    disabled = Column(Boolean, default=False)
    agents = relationship('Agents', 
                         secondary=agent_llm_provider, 
                         back_populates='llm_providers',
                         cascade="all, delete")

class KnowledgeBase(Base):
    __tablename__ = 'KnowledgeBases'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    disabled = Column(Boolean, default=False)
    agents = relationship('Agents', secondary=agent_knowledge_base, back_populates='_knowledge_bases')

class Agents(Base):
    __tablename__ = 'Agents'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    is_on_point_system = Column(Boolean, default=False, name="isOnPointSystem")
    chains = relationship('Chain', secondary=agent_chain, back_populates='agents')
    llm_providers = relationship('LlmProvider', 
                                secondary=agent_llm_provider, 
                                back_populates='agents',
                                cascade="all, delete")
    _knowledge_bases = relationship('KnowledgeBase', secondary=agent_knowledge_base, back_populates='agents')
    user_id = Column(String, ForeignKey('TwitterUsers.user_id'))
    user = relationship('TwitterUsers', back_populates='agents')

    @property
    def knowledgeBases(self):
        return self._knowledge_bases

class AgentPoint(Base):
    __tablename__ = 'AgentPoints'
    id = Column(String, primary_key=True, index=True)
    agent_id = Column(String, index=True,name="agentId")
    points = Column(Integer)
