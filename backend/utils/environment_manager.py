import os
from typing import Dict, Any, Generator

from dotenv import dotenv_values

from utils.constants.environment_keys import EnvironmentKeys
from utils.logger import logger


class EnvironmentManager:
    environment_values: Dict[str, str] = dict()

    def __init__(self):
        env = os.getenv(EnvironmentKeys.OS.value)
        if env == "prod":
            for key in EnvironmentKeys:
                self.environment_values[key.value] = os.getenv(key.value)
        else:
            self.environment_values = dotenv_values("././.env")

    def get_key(self, key) -> str:
        return self.environment_values[key]


def get_environment_manager() -> Generator[EnvironmentManager, Any, None]:
    ev_manager = EnvironmentManager()
    try:
        yield ev_manager
        logger.logger.info("Environment manager init is done")
    except Exception as e:
        logger.logger.error(e)