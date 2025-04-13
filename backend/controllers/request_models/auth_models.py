from pydantic import BaseModel


class AdminRequest(BaseModel):
    wallet_address: str
    signature: str

class RegisterUserRequest(BaseModel):
    wallet_address: str
    tx_hash: str
    user_id: str

class GenerateTokenRequest(BaseModel):
    user_id: str

class CheckTokenRequest(BaseModel):
    user_id: str

class CreateWalletRequest(BaseModel):
    wallet_address: str

class CheckSpecialCodeRequest(BaseModel):
    code: str
    user_id: str

class DeleteSpecialCodeByAdminRequest(BaseModel):
    code_id: str

class UseSpecialCodeByAdminRequest(BaseModel):
    code_id: str

class VerifySpecialCodeByAdminRequest(BaseModel):
    code: str
