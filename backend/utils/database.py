from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from utils.environment_manager import EnvironmentManager
from utils.constants.environment_keys import EnvironmentKeys
from utils.logger import logger


class Database:
    def __init__(self,ev_manager = EnvironmentManager()):
        connection_string = ev_manager.get_key(EnvironmentKeys.CONNECTION_STRING.value)

        self.engine = create_engine(connection_string, pool_pre_ping=True)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db: Session = self.SessionLocal()

    def get_session(self):
        return self.SessionLocal()

    def close(self):
        self.db.close()

def get_db():
    db_instance = Database()
    db = db_instance.get_session()  # Get an SQLAlchemy session
    try:
        yield db
        logger.info("Database init is done")
    except Exception as e:
        logger.error(e)