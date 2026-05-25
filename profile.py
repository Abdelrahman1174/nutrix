from fastapi import APIRouter, HTTPException
from app.models.profile import ProfileSetupRequest, ProfileSetupResponse
from app.services.calculator import calculate_calories
from app.core.supabase_client import db

router = APIRouter()


@router.post("/setup", response_model=ProfileSetupResponse)
def setup_profile(body: ProfileSetupRequest):
    """
    Phase 1 — Body Inputs & Macros.
    Calculates BMR/TDEE/macros, persists to users + nutrition_targets.
    """
    result = calculate_calories(
        weight=body.weight,
        height=body.height,
        age=body.age,
        gender=body.gender,
        activity_level=body.activity_level,
        goal=body.goal,
    )

    # --- Update users table ---
    user_update = (
        db.table("users")
        .update({
            "weight_kg":      body.weight,
            "height_cm":      body.height,
            "age":            body.age,
            "gender":         body.gender.value,
            "activity_level": body.activity_level.value,
            "goal":           body.goal.value,
            "bmr":            result.bmr,
            "tdee":           result.tdee,
        })
        .eq("user_id", body.user_id)
        .execute()
    )
    if not user_update.data:
        raise HTTPException(status_code=404, detail="User not found.")

    # --- Insert into nutrition_targets ---
    target_insert = (
        db.table("nutrition_targets")
        .insert({
            "user_id":         body.user_id,
            "target_calories": result.calories,
            "target_protein":  result.protein,
            "target_carbs":    result.carbs,
            "target_fats":     result.fat,
        })
        .execute()
    )
    target_id = target_insert.data[0]["target_id"]

    return ProfileSetupResponse(
        user_id=body.user_id,
        bmr=result.bmr,
        tdee=result.tdee,
        target_calories=result.calories,
        target_protein=result.protein,
        target_carbs=result.carbs,
        target_fats=result.fat,
        target_id=target_id,
    )
