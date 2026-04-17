from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any

from backend.services.calorie_service import (
    calculate_calories,
    Gender,
    Goal,
    ActivityLevel,
)
from backend.services.ml_service import predict_condition

router = APIRouter(prefix="/plan", tags=["Plan"])


class CalorieRequest(BaseModel):
    weight: float = Field(..., gt=0, description="Weight in kg")
    height: float = Field(..., gt=0, description="Height in cm")
    age: int = Field(..., gt=0, description="Age in years")
    gender: Gender
    activity_level: ActivityLevel
    goal: Goal


@router.post("/calculate-calories")
def calculate_calories_endpoint(request: CalorieRequest):
    try:
        result = calculate_calories(
            weight=request.weight,
            height=request.height,
            age=request.age,
            gender=request.gender,
            activity_level=request.activity_level,
            goal=request.goal,
        )
        return {
            "calories": result.calories,
            "protein": result.protein,
            "fat": result.fat,
            "carbs": result.carbs,
            "bmr": result.bmr,
            "tdee": result.tdee,
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


class ConditionRequest(BaseModel):
    input_data: dict[str, Any] = Field(..., description="Medical marker fields as key-value pairs")


@router.post("/predict-condition")
def predict_condition_endpoint(request: ConditionRequest):
    try:
        condition = predict_condition(request.input_data)
        return {"predicted_condition": condition}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


class GeneratePlanRequest(BaseModel):
    # Manual inputs
    weight: float = Field(..., gt=0, description="Weight in kg")
    height: float = Field(..., gt=0, description="Height in cm")
    age: int = Field(..., gt=0, description="Age in years")
    gender: Gender
    activity_level: ActivityLevel
    goal: Goal
    # Medical inputs
    medical_data: dict[str, Any] = Field(..., description="Medical marker fields from PDF or manual entry")


@router.post("/generate-plan")
def generate_plan_endpoint(request: GeneratePlanRequest):
    try:
        condition = predict_condition(request.medical_data)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Condition prediction failed: {str(e)}")

    try:
        calories = calculate_calories(
            weight=request.weight,
            height=request.height,
            age=request.age,
            gender=request.gender,
            activity_level=request.activity_level,
            goal=request.goal,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Calorie calculation failed: {str(e)}")

    return {
        "predicted_condition": condition,
        "nutrition": {
            "calories": calories.calories,
            "protein": calories.protein,
            "fat": calories.fat,
            "carbs": calories.carbs,
            "bmr": calories.bmr,
            "tdee": calories.tdee,
        },
    }
