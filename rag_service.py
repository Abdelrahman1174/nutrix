from typing import Optional

import pandas as pd
from scipy.optimize import minimize

from services.food_service import filter_by_conditions

CONDITION_MAP: dict[str, dict[str, bool]] = {
    "diabetes":         {"diabetes": True,  "hypertension": False, "cholesterol": False, "anemia": False},
    "hypertension":     {"diabetes": False, "hypertension": True,  "cholesterol": False, "anemia": False},
    "cholesterol":      {"diabetes": False, "hypertension": False, "cholesterol": True,  "anemia": False},
    "high_cholesterol": {"diabetes": False, "hypertension": False, "cholesterol": True,  "anemia": False},
    "anemia":           {"diabetes": False, "hypertension": False, "cholesterol": False, "anemia": True},
    "fit":              {"diabetes": False, "hypertension": False, "cholesterol": False, "anemia": False},
}

_FALLBACK_CONDITIONS = {"diabetes": False, "hypertension": False, "cholesterol": False, "anemia": False}


def _condition_to_dict(
    condition: str | list[str]
) -> dict[str, bool]:

    combined = _FALLBACK_CONDITIONS.copy()

    # convert single condition to list
    if isinstance(condition, str):
        condition = [condition]

    for cond in condition:

        mapped = CONDITION_MAP.get(
            cond.lower(),
            CONDITION_MAP["fit"]
        )

        for key, value in mapped.items():
            if value:
                combined[key] = True

    return combined


def generate_meal_plan(
    condition: str | list[str],
    calories: float,
    protein: float
) -> dict | str:
    conditions = _condition_to_dict(condition)
    allowed_df = filter_by_conditions(conditions)

    breakfast_opts = allowed_df[allowed_df['Meal_Category'] == 'Breakfast']
    lunch_opts     = allowed_df[allowed_df['Meal_Category'].isin(['Lunch/Dinner', 'Versatile'])]
    dinner_opts    = allowed_df[allowed_df['Meal_Category'].isin(['Lunch/Dinner', 'Versatile'])]
    snack_opts     = allowed_df[allowed_df['Meal_Category'].isin(['Snack', 'Versatile'])]

    if any(len(df) == 0 for df in [breakfast_opts, lunch_opts, dinner_opts, snack_opts]):
        print("No food options found for condition, using fallback unfiltered dataset")
        allowed_df     = filter_by_conditions(_FALLBACK_CONDITIONS)
        breakfast_opts = allowed_df[allowed_df['Meal_Category'] == 'Breakfast']
        lunch_opts     = allowed_df[allowed_df['Meal_Category'].isin(['Lunch/Dinner', 'Versatile'])]
        dinner_opts    = allowed_df[allowed_df['Meal_Category'].isin(['Lunch/Dinner', 'Versatile'])]
        snack_opts     = allowed_df[allowed_df['Meal_Category'].isin(['Snack', 'Versatile'])]

    if any(len(df) == 0 for df in [breakfast_opts, lunch_opts, dinner_opts, snack_opts]):
        return "Error: Food dataset has no entries for one or more meal categories."

    best_plan: Optional[dict] = None
    best_error = float('inf')

    for _ in range(50):
        try:
            b = breakfast_opts.sample(1).iloc[0]
            l = lunch_opts.sample(1).iloc[0]
            d = dinner_opts.sample(1).iloc[0]
            s = snack_opts.sample(1).iloc[0]
            foods = [b, l, d, s]

            def loss_function(quantities):
                total_cals = sum(f['Energy']  * q for f, q in zip(foods, quantities))
                total_prot = sum(f['Protein'] * q for f, q in zip(foods, quantities))
                return (total_cals - calories) ** 2 + (total_prot - protein) ** 2 * 10

            result = minimize(
                loss_function,
                x0=[1.0, 1.0, 1.0, 1.0],
                bounds=[(0.5, 2.5)] * 4,
                method='SLSQP',
            )

            if result.success and result.fun < best_error:
                best_error = result.fun
                best_plan = {
                    'foods':      foods,
                    'quantities': result.x,
                    'total_cals': sum(f['Energy']  * q for f, q in zip(foods, result.x)),
                    'total_prot': sum(f['Protein'] * q for f, q in zip(foods, result.x)),
                }
        except Exception:
            continue

    if best_plan is None:
        return "Error: Optimizer could not find a valid meal plan after 50 attempts."

    foods      = best_plan['foods']
    quantities = best_plan['quantities']
    meal_names = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

    def build_meal(food, qty: float, name: str) -> dict:
        return {
            "name":             name,
            "food_description": food['Food Description'],
            "measure":          food.get('Measure Description', ''),
            "quantity":         round(float(qty), 2),
            "calories":         round(float(food['Energy'])       * qty, 1),
            "protein":          round(float(food['Protein'])      * qty, 1),
            "fat":              round(float(food['Total_Fat'])    * qty, 1),
            "carbs":            round(float(food['Carbohydrate']) * qty, 1),
        }

    meals = [build_meal(f, q, n) for f, q, n in zip(foods, quantities, meal_names)]

    return {
        "breakfast":      meals[0],
        "lunch":          meals[1],
        "dinner":         meals[2],
        "snack":          meals[3],
        "total_calories": round(float(best_plan['total_cals']), 1),
        "total_protein":  round(float(best_plan['total_prot']), 1),
    }
