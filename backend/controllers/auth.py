from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
import jwt
import os
from datetime import datetime

from controllers.request_models.auth_models import AdminRequest
from models.user import RegisteredUser, SpecialUserCode, ArbitrumWallet, Admin
from models.chain import Transaction
from pydantic import BaseModel
from utils.database import get_db
from middleware.withAdmin import verify_admin

router = APIRouter(prefix="/auth", tags=["Auth"])

class WalletAddressRequest(BaseModel):
    walletAddress: str

@router.post("/admin")
async def admin_login(adminRequest: AdminRequest, db: Session = Depends(get_db)):
    # Verify admin exists in database
    admin = db.query(Admin).filter(Admin.wallet_address == adminRequest.walletAddress).first()
    if not admin:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Generate JWT token
    token = jwt.encode({"walletAddress": admin.wallet_address}, os.getenv("SECRET_KEY"), algorithm="HS256")
    return {"message": "Authorized", "token": token, "isAdmin": True}

@router.get("/codes")
async def get_codes(db: Session = Depends(get_db), admin_payload: dict = Depends(verify_admin)):
    try:
        codes = db.query(SpecialUserCode).all()
        return {"codes": codes, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/register")
async def register_user(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    transaction_hash = data.get("signature")
    user_wallet = data.get("user_wallet")

    if not transaction_hash or not user_wallet:
        raise HTTPException(status_code=400, detail="Missing parameters")

    # Create and save transaction record
    transaction = Transaction(transaction_hash=transaction_hash, user_wallet=user_wallet)
    db.add(transaction)
    
    # Create and save registered user
    registered_user = RegisteredUser(user_wallet=user_wallet)
    db.add(registered_user)
    db.commit()

    return {"message": "Subscription registered successfully", "user": {"user_wallet": registered_user.user_wallet}}

@router.post("/token")
async def generate_token(request: Request):
    data = await request.json()
    wallet_address = data.get("walletAddress")

    if not wallet_address:
        raise HTTPException(status_code=400, detail="Wallet address is required")

    token = jwt.encode({"walletAddress": wallet_address}, os.getenv("SECRET_KEY"), algorithm="HS256")
    return {"token": token}

@router.post("/check")
async def check_user(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    user_wallet = data.get("userWallet")
    did = data.get("did")

    if not user_wallet and not did:
        raise HTTPException(status_code=400, detail="Both userWallet and did cannot be null")

    user = db.query(RegisteredUser).filter((RegisteredUser.user_wallet == user_wallet) | (RegisteredUser.user_wallet == did)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User check successful", "isAllowed": True}

@router.post("/wallet")
async def create_wallet(request: Request, db: Session = Depends(get_db), admin_payload: dict = Depends(verify_admin)):
    data = await request.json()
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
        
    access_token = auth_header.split(" ")[1]

    if not access_token:
        raise HTTPException(status_code=400, detail="Missing token")

    try:
        # Verify token
        payload = jwt.decode(access_token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        wallet_address = payload.get("walletAddress")
        
        # Check if user exists
        user = db.query(RegisteredUser).filter(RegisteredUser.user_wallet == wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Create wallet
        wallet = ArbitrumWallet(
            wallet_address="some_address",  # This should be generated properly
            private_key="some_key",         # This should be generated properly
            mnemonic="some_mnemonic"        # This should be generated properly
        )
        db.add(wallet)
        db.commit()

        return {"message": "Wallet created successfully", "walletAddress": wallet.wallet_address}
    
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/code/check")
async def check_code(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    code = data.get("code")
    wallet_address = data.get("walletAddress")
    
    if not code:
        raise HTTPException(status_code=400, detail="Code is required")
    
    try:
        # Find the code
        user_code = db.query(SpecialUserCode).filter(
            SpecialUserCode.code == code,
            SpecialUserCode.is_used == False
        ).first()
        
        if not user_code:
            return {"exists": False}
        
        # Mark code as used
        user_code.is_used = True
        user_code.used_by = wallet_address
        
        # Register the user
        registered_user = RegisteredUser(user_wallet=wallet_address)
        db.add(registered_user)
        db.commit()
        
        return {"exists": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/generate")
async def generate_code(db: Session = Depends(get_db), admin_payload: dict = Depends(verify_admin)):
    import random
    import string
    
    # Generate a random code
    random_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    # Create the code in the database
    code = SpecialUserCode(code=random_code, used_by="")
    db.add(code)
    db.commit()
    
    return {"code": code.code}

@router.delete("/code")
async def delete_code(request: Request, db: Session = Depends(get_db), admin_payload: dict = Depends(verify_admin)):
    data = await request.json()
    code_id = data.get("id")
    
    if not code_id:
        raise HTTPException(status_code=400, detail="ID is required")
    
    try:
        code = db.query(SpecialUserCode).filter(SpecialUserCode.id == code_id).first()
        if not code:
            raise HTTPException(status_code=404, detail="Code not found")
        
        db.delete(code)
        db.commit()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/use")
async def use_code(request: Request, db: Session = Depends(get_db), admin_payload: dict = Depends(verify_admin)):
    data = await request.json()
    code_id = data.get("id")
    
    if not code_id:
        raise HTTPException(status_code=400, detail="ID is required")
    
    try:
        code = db.query(SpecialUserCode).filter(SpecialUserCode.id == code_id).first()
        if not code:
            raise HTTPException(status_code=404, detail="Code not found")
        
        code.is_used = True
        db.commit()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/verify")
async def verify_code(request: Request, db: Session = Depends(get_db), admin_payload: dict = Depends(verify_admin)):
    data = await request.json()
    code_value = data.get("code")
    
    if not code_value:
        raise HTTPException(status_code=400, detail="Code is required")
    
    try:
        code = db.query(SpecialUserCode).filter(
            SpecialUserCode.code == code_value,
            SpecialUserCode.is_used == False
        ).first()
        
        if code:
            return {"exists": True}
        else:
            return {"exists": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


