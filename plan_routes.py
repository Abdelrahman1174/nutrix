from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from services.calorie_service import ActivityLevel, Gender, Goal, calculate_calories
from services.ml_service import predict_condition
from services.pdf_service import extract_biomarkers
from services.rag_service import generate_meal_plan
from services.db_service import save_meal_plan

router = APIRouter(prefix="/plan", tags=["Plan"])


# ---------------------------------------------------------------------------
# /calculate-calories
# ---------------------------------------------------------------------------

class CalorieRequest(BaseModel):
    weight:         float         = Field(..., gt=0, description="Weight in kg")
    height:         float         = Field(..., gt=0, description="Height in cm")
    age:            int           = Field(..., gt=0, description="Age in years")
    gender:         Gender
    activity_level: ActivityLevel
    goal:           Goal


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
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return {
        "calories": result.calories,
        "protein":  result.protein,
        "fat":      result.fat,
        "carbs":    result.carbs,
        "bmr":      result.bmr,
        "tdee":     result.tdee,
    }


# ---------------------------------------------------------------------------
# /predict-condition
# ---------------------------------------------------------------------------

class ConditionRequest(BaseModel):
    input_data: dict[str, Any] = Field(..., description="Medical marker fields as key-value pairs")


@router.post("/predict-condition")
def predict_condition_endpoint(request: ConditionRequest):
    try:
        condition = predict_condition(request.input_data)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return {"predicted_condition": condition}


# ---------------------------------------------------------------------------
# /extract-pdf  — standalone PDF biomarker extraction
# ---------------------------------------------------------------------------

@router.post("/extract-pdf")
async def extract_pdf_endpoint(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    pdf_bytes = await file.read()
    biomarkers = extract_biomarkers(pdf_bytes)
    return {"biomarkers": biomarkers}


# ---------------------------------------------------------------------------
# /generate-plan  — full pipeline: manual input → ML → Calories → RAG
# ---------------------------------------------------------------------------

class GeneratePlanRequest(BaseModel):
    weight:         float          = Field(..., gt=0)
    height:         float          = Field(..., gt=0)
    age:            int            = Field(..., gt=0)
    gender:         Gender
    activity_level: ActivityLevel
    goal:           Goal
    medical_data:   dict[str, Any] = Field(..., description="Biomarker values, e.g. {\"glucose\": 95, \"hemoglobin\": 13.5}")
    user_id:        str | None     = Field(None, description="If provided, plan is saved to the database")
    access_token:   str | None     = Field(None, description="User's auth token (required to save the plan)")


@router.post("/generate-plan")
def generate_plan_endpoint(request: GeneratePlanRequest):
    # 1. ML → condition
    try:
        condition = predict_condition(request.medical_data)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Condition prediction failed: {e}")

    # 2. Calories
    try:
        nutrition = calculate_calories(
            weight=request.weight,
            height=request.height,
            age=request.age,
            gender=request.gender,
            activity_level=request.activity_level,
            goal=request.goal,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Calorie calculation failed: {e}")

    # 3. RAG → meal plan
    meal_plan = generate_meal_plan(
        condition=condition,
        calories=nutrition.calories,
        protein=nutrition.protein,
    )

    if isinstance(meal_plan, str):
        raise HTTPException(status_code=422, detail=meal_plan)

    if request.user_id:
        try:
            save_meal_plan(
                user_id=request.user_id,
                total_calories=nutrition.calories,
                total_protein=nutrition.protein,
                total_carbs=nutrition.carbs,
                total_fats=nutrition.fat,
                access_token=request.access_token or "",
            )
        except Exception as e:
            print(f"save_meal_plan error: {e}")
            raise HTTPException(status_code=500, detail=f"Plan generated but failed to save: {e}")

    return {
        "predicted_condition": condition,
        "nutrition": {
            "calories": nutrition.calories,
            "protein":  nutrition.protein,
            "fat":      nutrition.fat,
            "carbs":    nutrition.carbs,
            "bmr":      nutrition.bmr,
            "tdee":     nutrition.tdee,
        },
        "meal_plan": meal_plan,
    }


# ---------------------------------------------------------------------------
# /meal-plan  — direct meal plan (condition + physical data, no ML step)
# ---------------------------------------------------------------------------

class MealPlanRequest(BaseModel):
    weight:         float                = Field(..., gt=0)
    height:         float                = Field(..., gt=0)
    age:            int                  = Field(..., gt=0)
    gender:         Gender
    activity_level: ActivityLevel
    goal:           Goal
    conditions:     dict[str, bool]      = Field(default_factory=dict)


@router.post("/meal-plan")
def meal_plan_endpoint(request: MealPlanRequest):
    try:
        nutrition = calculate_calories(
            weight=request.weight,
            height=request.height,
            age=request.age,
            gender=request.gender,
            activity_level=request.activity_level,
            goal=request.goal,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Derive condition string from conditions dict for the RAG mapper
    condition = next((k for k, v in request.conditions.items() if v), "fit")

    meal_plan = generate_meal_plan(
        condition=condition,
        calories=nutrition.calories,
        protein=nutrition.protein,
    )

    if isinstance(meal_plan, str):
        raise HTTPException(status_code=422, detail=meal_plan)

    return {
        "breakfast":     meal_plan["breakfast"],
        "lunch":         meal_plan["lunch"],
        "dinner":        meal_plan["dinner"],
        "snack":         meal_plan["snack"],
        "total_calories": meal_plan["total_calories"],
        "total_protein":  meal_plan["total_protein"],
        "nutrition_goals": {
            "calories": nutrition.calories,
            "protein":  nutrition.protein,
        },
    }
