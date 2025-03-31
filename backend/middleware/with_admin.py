from fastapi import Request, HTTPException
import jwt
from utils.constants.environment_keys import EnvironmentKeys
from utils.environment_manager import EnvironmentManager


async def verify_admin(request: Request):
    env_manager = EnvironmentManager()
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    
    try:
        payload = jwt.decode(token, env_manager.get_key(EnvironmentKeys.SECRET_KEY.name), algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token") 