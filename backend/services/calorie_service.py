from dataclasses import dataclass
from enum import Enum


class Gender(str, Enum):
    male = "male"
    female = "female"


class Goal(str, Enum):
    lose = "lose"
    maintain = "maintain"
    gain = "gain"


class ActivityLevel(str, Enum):
    sedentary = "sedentary"
    lightly_active = "lightly_active"
    moderately_active = "moderately_active"
    very_active = "very_active"
    extra_active = "extra_active"


ACTIVITY_MULTIPLIERS = {
    ActivityLevel.sedentary: 1.2,
    ActivityLevel.lightly_active: 1.375,
    ActivityLevel.moderately_active: 1.55,
    ActivityLevel.very_active: 1.725,
    ActivityLevel.extra_active: 1.9,
}

GOAL_MULTIPLIERS = {
    Goal.gain: 1.20,
    Goal.maintain: 1.0,
    Goal.lose: 0.80,
}


@dataclass
class CalorieResult:
    calories: float
    protein: float
    fat: float
    carbs: float
    bmr: float
    tdee: float


def calculate_calories(
    weight: float,       # kg
    height: float,       # cm
    age: int,
    gender: Gender,
    activity_level: ActivityLevel,
    goal: Goal,
) -> CalorieResult:
    if weight <= 0 or height <= 0 or age <= 0:
        raise ValueError("Weight, height, and age must be positive values.")

    # BMR — Mifflin-St Jeor Equation
    if gender == Gender.male:
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161

    # TDEE
    tdee = bmr * ACTIVITY_MULTIPLIERS[activity_level]

    # Adjust for goal
    calorie_goal = tdee * GOAL_MULTIPLIERS[goal]

    # Macronutrients
    protein_grams = weight * 2
    protein_cal = protein_grams * 4

    fat_cal = calorie_goal * 0.30
    fat_grams = fat_cal / 9

    carb_grams = (calorie_goal - protein_cal - fat_cal) / 4

    return CalorieResult(
        calories=round(calorie_goal, 2),
        protein=round(protein_grams, 2),
        fat=round(fat_grams, 2),
        carbs=round(carb_grams, 2),
        bmr=round(bmr, 2),
        tdee=round(tdee, 2),
    )
