from sqlalchemy import Column, Integer, String, DateTime, func, Boolean, Table, ForeignKey, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from models.chain import Base, TwitterUsers
from sqlalchemy.sql import expression
from sqlalchemy import event

class Voices(Base):
    __tablename__ = "Voices"
    id = Column(Integer, primary_key=True, index=True)
    voice_id = Column(String, unique=True)
    voice_bytes = Column(LargeBinary)
    user_id = Column(String, ForeignKey('TwitterUsers.user_id'))
    ipfs_hash = Column(String, default="")
    share_for_training = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

@event.listens_for(Voices, 'before_insert')
def set_created_updated_at(mapper, connection, target):
    target.created_at = func.now()
    target.updated_at = func.now()

@event.listens_for(Voices, 'before_update')
def set_updated_at(mapper, connection, target):
    target.updated_at = func.now()