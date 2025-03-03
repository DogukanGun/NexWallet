from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class RegisteredUser(Base):
    __tablename__ = 'RegisteredUsers'
    id = Column(Integer, primary_key=True, index=True)
    user_wallet = Column(String, index=True)

class SpecialUserCode(Base):
    __tablename__ = 'SpecialUserCodes'
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, index=True)
    is_used = Column(Boolean, default=False)
    used_by = Column(String, index=True)

class ArbitrumWallet(Base):
    __tablename__ = 'ArbitrumWallets'
    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String, unique=True, index=True)
    private_key = Column(String)
    is_verified = Column(Boolean, default=False)
    mnemonic = Column(String, nullable=True)

class BaseWallet(Base):
    __tablename__ = 'BaseWallets'
    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String, unique=True, index=True)
    private_key = Column(String)
    is_verified = Column(Boolean, default=False)
    mnemonic = Column(String, nullable=True)

class Admin(Base):
    __tablename__ = 'Admins'
    wallet_address = Column(String, primary_key=True, index=True)

class Interaction(Base):
    __tablename__ = 'Interations'  # Note: keeping the typo from Prisma schema
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    page = Column(String)

class WalletInteraction(Base):
    __tablename__ = 'WalletInteraction'
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    operation = Column(String)
    success = Column(Boolean, default=False)