import logging
from logging.config import dictConfig
from typing import Any, Dict

from pydantic import BaseModel
class LogConfig(BaseModel):

    LOGGER_NAME: str = "API"
    LOG_FORMAT: str = "%(levelprefix)s  %(message)s"
    LOG_LEVEL: str = "DEBUG"

    version: int = 1
    disable_existing_loggers: bool = False
    formatters: Dict[str, Any] = {
        "default": {
            "()": "uvicorn.logging.DefaultFormatter",
            "fmt": LOG_FORMAT,
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    }
    handlers: Dict[str, Any] = {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",  # sys.stdout
        },
    }
    loggers: Dict[str, Any] = {
        "API": {"handlers": ["default"], "level": LOG_LEVEL},
        "uvicorn": {"handlers": ["default"], "level": LOG_LEVEL},
    }


application_log_level = logging.INFO + 1
logging.addLevelName(application_log_level, "APPLICATION")


def log_application_message(self, message, *args, **kwargs):
    if self.isEnabledFor(application_log_level):
        self._log(application_log_level, message, args, **kwargs)


logging.Logger.application = log_application_message
logger = logging.getLogger("API")

dictConfig(LogConfig().dict())