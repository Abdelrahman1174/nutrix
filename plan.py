from fastapi import APIRouter, HTTPException
from app.models.plan import PlanGenerateRequest, PlanGenerateResponse, MealItem
from app.services.optimizer import generate_meal_plan
from app.core.supabase_client import db

router = APIRouter()


@router.post("/generate", response_model=PlanGenerateResponse)
def generate_plan(body: PlanGenerateRequest):
    """
    Phase 3 — Plan Generation.
    Retrieves the user's latest nutrition targets + predicted condition,
    runs the optimizer, and persists the full meal_plans → meals → meal_items hierarchy.
    """
    # --- Fetch latest nutrition targets ---
    targets_resp = (
        db.table("nutrition_targets")
        .select("*")
        .eq("user_id", body.user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not targets_resp.data:
        raise HTTPException(status_code=404, detail="No nutrition targets found. Run /profile/setup first.")
    target = targets_resp.data[0]

    # --- Fetch latest predicted condition ---
    pred_resp = (
        db.table("predictions")
        .select("prediction_condition, predictions.created_at, medical_values(report_id, medical_reports(user_id))")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    condition = "fit"
    if pred_resp.data:
        condition = pred_resp.data[0].get("prediction_condition", "fit") or "fit"

    # --- Run optimizer ---
    plan_data = generate_meal_plan(
        condition=condition,
        calories=float(target["target_calories"]),
        protein=float(target["target_protein"]),
    )

    if "error" in plan_data:
        raise HTTPException(status_code=500, detail=plan_data["error"])

    # --- Persist meal_plans ---
    plan_insert = (
        db.table("meal_plans")
        .insert({
            "user_id":        body.user_id,
            "target_id":      target["target_id"],
            "total_calories": plan_data["total_calories"],
            "total_protein":  plan_data["total_protein"],
            "total_carbs":    sum(plan_data[m]["carbs"]   for m in ["breakfast","lunch","dinner","snack"]),
            "total_fats":     sum(plan_data[m]["fat"]     for m in ["breakfast","lunch","dinner","snack"]),
        })
        .execute()
    )
    plan_id = plan_insert.data[0]["plan_id"]

    # --- Persist meals + meal_items ---
    for meal_key in ["breakfast", "lunch", "dinner", "snack"]:
        meal = plan_data[meal_key]
        meal_insert = (
            db.table("meals")
            .insert({
                "plan_id":      plan_id,
                "meal_type":    meal_key,
                "meal_calories":meal["calories"],
                "meal_protein": meal["protein"],
                "meal_carbs":   meal["carbs"],
                "meal_fats":    meal["fat"],
            })
            .execute()
        )
        meal_id = meal_insert.data[0]["meal_id"]

        db.table("meal_items").insert({
            "meal_id":    meal_id,
            "food_id":    meal["food_id"],
            "quantity_g": meal["quantity_g"],
        }).execute()

    return PlanGenerateResponse(
        plan_id=plan_id,
        breakfast=MealItem(**plan_data["breakfast"]),
        lunch=MealItem(**plan_data["lunch"]),
        dinner=MealItem(**plan_data["dinner"]),
        snack=MealItem(**plan_data["snack"]),
        total_calories=plan_data["total_calories"],
        total_protein=plan_data["total_protein"],
        condition=condition,
    )
