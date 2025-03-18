import requests
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from models import TwitterUsers
from utils.constants.environment_keys import EnvironmentKeys
from utils.database import get_db
from utils.environment_manager import get_environment_manager, EnvironmentManager
import secrets
import urllib.parse
import base64
import hashlib
import json

router = APIRouter(prefix="/api/twitter", tags=["twitter"])

# Matching exactly the X API documentation format
AUTHORIZATION_URL = 'https://x.com/i/oauth2/authorize'
TOKEN_URL = 'https://api.x.com/2/oauth2/token'
def generate_code_verifier():
    return base64.urlsafe_b64encode(secrets.token_bytes(32)).decode("utf-8").rstrip("=")

def generate_code_challenge(code_verifier):
    digest = hashlib.sha256(code_verifier.encode()).digest()
    return base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")

verifiers = {}

# Using plain code challenge as shown in the documentation
@router.get("/login")
async def login(
    request: Request,
    environment_manager: EnvironmentManager = Depends(get_environment_manager)
):
    # Dynamically construct the REDIRECT_URI
    REDIRECT_URI = f"{request.base_url}api/twitter/callback"
    
    code_verifier = generate_code_verifier()
    code_challenge = generate_code_challenge(code_verifier)

    request.session["code_verifier"] = code_verifier

    # Use the exact format from X documentation
    scope = "tweet.read users.read"
    state = secrets.token_urlsafe(16)
    encoded_scope = urllib.parse.quote(scope, safe='')
    redirect_uri = urllib.parse.quote(REDIRECT_URI, safe='')
    verifiers[state] = code_verifier

    # Format the authorization URL exactly as shown in the documentation
    auth_url = (f"{AUTHORIZATION_URL}?"
                f"response_type=code&"
                f"client_id={environment_manager.get_key(EnvironmentKeys.TWITTER_CLIENT_ID.name)}&"
                f"redirect_uri={redirect_uri}&"
                f"scope={encoded_scope}&"
                f"state={state}&"
                f"code_challenge={code_verifier}&"
                f"code_challenge_method=plain")

    print(auth_url)

    return RedirectResponse(auth_url)

@router.get("/callback")
async def callback(
    request: Request,
    code: str,
    db: Session = Depends(get_db),
    environment_manager: EnvironmentManager = Depends(get_environment_manager)
):
    REDIRECT_URI = f"{request.base_url}api/twitter/callback"
    print(f"Received code: {code}")  # Log the received code
    code_verifier = request.session.get("code_verifier")
    if code_verifier is None:
        code_verifier = verifiers[request.query_params.get("state")]
    # Get client ID and client secret
    client_id = environment_manager.get_key(EnvironmentKeys.TWITTER_CLIENT_ID.name)
    client_secret = environment_manager.get_key(EnvironmentKeys.TWITTER_CLIENT_SECRET.name)

    # Prepare the data for the token request
    data = {
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': REDIRECT_URI,
        'code_verifier': code_verifier
    }

    # Encode client_id and client_secret for Basic Auth
    credentials = f"{client_id}:{client_secret}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Basic {encoded_credentials}'
    }

    try:
        token_response = requests.post(TOKEN_URL, data=data, headers=headers)

        print(f"Token request data: {token_response.request.body}")  # Log the request body
        print(f"Token response status: {token_response.status_code}")
        print(f"Token response content: {token_response.text}")

        token_response.raise_for_status()

    except requests.exceptions.RequestException as e:
        error_msg = f"Failed to obtain access token: {str(e)}"
        if hasattr(e, 'response') and e.response is not None:
            error_msg = f"{error_msg}. Response: {e.response.text}"
        raise HTTPException(status_code=400, detail=error_msg)

    # Step 4: Store the tokens in the session
    token_data = token_response.json()
    request.session['access_token'] = token_data.get('access_token')
    request.session['refresh_token'] = token_data.get('refresh_token')
    
    # Store expiration time if provided
    if 'expires_in' in token_data:
        import time
        request.session['token_expiry'] = time.time() + token_data.get('expires_in')

    # Step 5: Get user profile information
    user_data = None
    try:
        user_response = requests.get('https://api.x.com/2/users/me', headers={
            'Authorization': f'Bearer {token_data.get("access_token")}'
        })
        user_response.raise_for_status()
        user_data = user_response.json()
        user = {
            'id': user_data.get('data', {}).get('id'),
            'username': user_data.get('data', {}).get('username'),
            'name': user_data.get('data', {}).get('name')
        }
        user_from_db = db.query(TwitterUsers).filter(TwitterUsers.user_id == user["id"]).first()
        if user_from_db is None:
            db_user = TwitterUsers(user_id=user["id"], username=user["username"], name=user["name"])
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        request.session['user'] = user
        print(f"User data: {user_data}")
    except Exception as e: 
        print(e)
        user = None
    
    # Create redirect URL with user data as query parameters
    frontend_base_url = f"{environment_manager.get_key(EnvironmentKeys.FRONTEND_URL.name)}auth-success"
    
    # Only add query parameters if we have user data
    if user:
        encoded_user = urllib.parse.quote(json.dumps(user))
        frontend_redirect_url = f"{frontend_base_url}?user={encoded_user}"
    else:
        frontend_redirect_url = frontend_base_url
        
    return RedirectResponse(frontend_redirect_url)

@router.get("/user")
async def get_user(request: Request):
    # Get current user info from session
    access_token = request.session.get('access_token')
    user = request.session.get('user')
    
    if not access_token:
        return {"authenticated": False}
    
    if not user:
        try:
            # Try to fetch user profile if not in session
            user_response = requests.get('https://api.x.com/2/users/me', headers={
                'Authorization': f'Bearer {access_token}'
            })
            user_response.raise_for_status()
            user_data = user_response.json()
            user = {
                'id': user_data.get('data', {}).get('id'),
                'username': user_data.get('data', {}).get('username'),
                'name': user_data.get('data', {}).get('name')
            }
            request.session['user'] = user
        except:
            return {"authenticated": True, "user": None}
            
    return {"authenticated": True, "user": user}

@router.get("/logout")
async def logout(request: Request, response: Response):
    # Clear session
    request.session.clear()
    return {"message": "Logged out successfully"}