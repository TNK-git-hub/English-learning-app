from fastapi import APIRouter, Depends
from models.schemas import LoginRequest
from config.database import get_db
import bcrypt

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/login")
def login(request: LoginRequest, db = Depends(get_db)):
    """
    Login endpoint — validate against database.
    """
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (request.email,))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return {"status": "Error", "message": "Invalid email or password. Please try again."}

    password_matched = False
    try:
        if bcrypt.checkpw(request.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            password_matched = True
    except Exception:
        if request.password == user['password_hash']:
            password_matched = True

    if not password_matched:
        return {"status": "Error", "message": "Invalid email or password. Please try again."}

    return {
        "status": "Success",
        "message": "Đăng nhập thành công",
        "token": "mock_token_for_development",
        "user": {
            "userId": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role']
        }
    }
