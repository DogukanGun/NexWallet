from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import jwt
import os
from datetime import datetime
import random
import string
from controllers.request_models.auth_models import AdminRequest, RegisterUserRequest, GenerateTokenRequest, \
    CheckTokenRequest, CreateWalletRequest, CheckSpecialCodeRequest, \
    DeleteSpecialCodeByAdminRequest, UseSpecialCodeByAdminRequest, VerifySpecialCodeByAdminRequest
from models.auth import AuthPayload
from models import RegisteredUser, SpecialUserCode, Admin, UserWallet
from models.chain import Transaction
from pydantic import BaseModel
from utils.database import get_db
from middleware.withAdmin import verify_admin

router = APIRouter(prefix="/auth", tags=["Auth"])

class UserIdRequest(BaseModel):
    user_id: str

@router.post("/admin")
async def admin_login(admin_request: AdminRequest, db: Session = Depends(get_db)):
    try:
        # Verify admin exists in database using user_id
        admin = db.query(Admin).filter(Admin.user_id == admin_request.wallet_address).first()
        if not admin:
            raise HTTPException(status_code=403, detail="Unauthorized")

        # TODO: Implement signature verification here
        # For now, we'll skip signature verification and just check if admin exists

        # Generate JWT token
        payload = AuthPayload(user_id=admin.user_id)
        token = jwt.encode(payload.__dict__, os.getenv("SECRET_KEY"), algorithm="HS256")
        return {"message": "Authorized", "token": token, "isAdmin": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin")
async def admin_check(admin_payload: dict = Depends(verify_admin), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.user_id == admin_payload["user_id"]).first()
    if not admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return {"message": "Authorized", "isAdmin": True}

@router.get("/codes")
async def get_codes(db: Session = Depends(get_db), admin_payload: dict = Depends(verify_admin)):
    try:
        codes = db.query(SpecialUserCode).all()
        return {"codes": codes, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/register")
async def register_user(request: RegisterUserRequest, db: Session = Depends(get_db)):
    if not request.tx_hash or not request.user_id:
        raise HTTPException(status_code=400, detail="Missing parameters")

    # Create and save transaction record
    transaction = Transaction(transaction_hash=request.tx_hash, user_wallet=request.wallet_address)  # Adjusted
    db.add(transaction)
    
    # Create and save registered user
    registered_user = RegisteredUser(user_id=request.user_id)  # Adjusted
    db.add(registered_user)
    db.commit()

    return {"message": "Subscription registered successfully", "user": {"user_id": registered_user.user_id}}  # Adjusted

@router.post("/token")
async def generate_token(request: GenerateTokenRequest):
    if not request.user_id:
        raise HTTPException(status_code=400, detail="User ID is required")

    token = jwt.encode({"user_id": request.user_id}, os.getenv("SECRET_KEY"), algorithm="HS256")
    return {"token": token}

@router.post("/check")
async def check_user(request: CheckTokenRequest, db: Session = Depends(get_db)):
    if not request.user_id:
        raise HTTPException(status_code=400, detail="user_id cannot be null")

    user = db.query(RegisteredUser).filter(RegisteredUser.user_id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User check successful", "isAllowed": True}

@router.post("/wallet")
async def create_wallet(request: CreateWalletRequest, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
        
    access_token = auth_header.split(" ")[1]

    if not access_token:
        raise HTTPException(status_code=400, detail="Missing token")

    try:
        # Verify token
        payload = jwt.decode(access_token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        # Check if user exists
        user = db.query(RegisteredUser).filter(RegisteredUser.user_id == user_id).first()  # Adjusted
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Create wallet
        wallet = UserWallet(
            wallet_address=request.wallet_address,
            is_verified=True,
            user_id=user_id
        )
        db.add(wallet)
        db.commit()

        return {"message": "Wallet created successfully", "walletAddress": wallet.wallet_address}
    
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/code/check")
async def check_code(request: CheckSpecialCodeRequest, db: Session = Depends(get_db)):
    if not request.code:
        raise HTTPException(status_code=400, detail="Code is required")
    
    try:
        # Find the code
        user_code = db.query(SpecialUserCode).filter(
            SpecialUserCode.code == request.code,
            SpecialUserCode.is_used == False
        ).first()
        
        if not user_code:
            return {"exists": False}
        
        # Mark code as used
        user_code.is_used = True
        user_code.used_by = request.user_id
        
        # Register the user
        registered_user = RegisteredUser(user_id=request.user_id)  # Adjusted
        db.add(registered_user)
        db.commit()
        
        return {"exists": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/generate")
async def generate_code(db: Session = Depends(get_db), admin_payload: dict = Depends(verify_admin)):
    # Generate a random code
    random_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    # Create the code in the database
    code = SpecialUserCode(code=random_code, used_by="")
    db.add(code)
    db.commit()
    
    return {"code": code.code}

@router.delete("/code")
async def delete_code(request: DeleteSpecialCodeByAdminRequest, db: Session = Depends(get_db), admin_payload: dict = Depends(verify_admin)):

    if not request.code_id:
        raise HTTPException(status_code=400, detail="ID is required")
    
    try:
        code = db.query(SpecialUserCode).filter(SpecialUserCode.id == request.code_id).first()
        if not code:
            raise HTTPException(status_code=404, detail="Code not found")
        
        db.delete(code)
        db.commit()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/use")
async def use_code(request: UseSpecialCodeByAdminRequest, db: Session = Depends(get_db)):
    if not request.code_id:
        raise HTTPException(status_code=400, detail="ID is required")
    
    try:
        code = db.query(SpecialUserCode).filter(SpecialUserCode.id == request.code_id).first()
        if not code:
            raise HTTPException(status_code=404, detail="Code not found")
        
        code.is_used = True
        db.commit()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/verify")
async def verify_code(request: VerifySpecialCodeByAdminRequest, db: Session = Depends(get_db), admin_payload: dict = Depends(verify_admin)):
    if not request.code:
        raise HTTPException(status_code=400, detail="Code is required")
    
    try:
        code = db.query(SpecialUserCode).filter(
            SpecialUserCode.code == request.code,
            SpecialUserCode.is_used == False
        ).first()
        
        if code:
            return {"exists": True}
        else:
            return {"exists": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


