from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.db_service import (
    create_user,
    login_user,
    get_user_by_id,
    get_user_meal_plans,
    test_db_connection,
)

router = APIRouter(prefix="/user", tags=["User"])


class RegisterRequest(BaseModel):
    name:     str = Field(..., min_length=1)
    email:    str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email:    str
    password: str


@router.post("/register")
def register(request: RegisterRequest):
    try:
        user = create_user(
            name=request.name,
            email=request.email,
            password=request.password,
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "User registered successfully.", "user": user}


@router.post("/login")
def login(request: LoginRequest):
    try:
        user = login_user(email=request.email, password=request.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    return {"message": "Login successful.", "user": user}


@router.get("/test-db")
def test_db():
    return test_db_connection()


@router.get("/{user_id}")
def get_user(user_id: str):
    try:
        user = get_user_by_id(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return user


@router.get("/{user_id}/plans")
def get_plans(user_id: str):
    try:
        get_user_by_id(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    plans = get_user_meal_plans(user_id)
    return {"user_id": user_id, "plans": plans}
