from supabase import create_client, Client

SUPABASE_URL = "https://kgedzhovmqtbytahtslp.supabase.co"
SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZWR6aG92bXF0Ynl0YWh0c2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzA4NTcsImV4cCI6MjA5MTkwNjg1N30"
    ".gH0tmEjd_Vq7kgvPHBpiaISVPNQrHe0eyXTjhB6i8ZA"
)

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def _auth_client(access_token: str, refresh_token: str = "") -> Client:
    """Return a client authenticated with the user's session (passes RLS)."""
    c = create_client(SUPABASE_URL, SUPABASE_KEY)
    c.auth.set_session(access_token, refresh_token or access_token)
    return c


# ---------------------------------------------------------------------------
# TASK 2: User operations  (password handled by Supabase Auth)
# ---------------------------------------------------------------------------

def create_user(name: str, email: str, password: str) -> dict:
    db = get_client()
    print(f"DB create_user: {email}")

    try:
        auth_resp = db.auth.sign_up({"email": email, "password": password})
    except Exception as e:
        raise ValueError(f"Registration failed: {e}")

    if not auth_resp.user:
        raise RuntimeError("Sign-up failed: no user returned from Supabase Auth.")

    user_id = auth_resp.user.id
    print(f"DB create_user: auth user created id={user_id}, session={bool(auth_resp.session)}")

    # Insert profile row — only works when email confirmation is disabled
    # (Supabase Dashboard → Auth → Email → toggle off "Confirm email")
    if auth_resp.session:
        try:
            ac = _auth_client(auth_resp.session.access_token, auth_resp.session.refresh_token)
            profile = ac.table("users").insert({
                "user_id":   user_id,
                "full_name": name,
                "email":     email,
                "role":      "client",
            }).execute()
            print("DB create_user profile insert:", profile.data)
        except Exception as e:
            print(f"DB create_user profile insert failed: {e}")
    else:
        print("DB create_user: email confirmation pending — profile row not inserted yet")

    return {
        "id":    user_id,
        "email": email,
        "name":  name,
        "requires_email_confirmation": auth_resp.session is None,
    }


def login_user(email: str, password: str) -> dict:
    db = get_client()
    print(f"DB login_user: {email}")

    try:
        resp = db.auth.sign_in_with_password({"email": email, "password": password})
    except Exception as e:
        raise ValueError(f"Login failed: {e}")

    if not resp.user:
        raise ValueError("Invalid email or password.")

    print(f"DB login_user: success id={resp.user.id}")
    return {
        "id":            resp.user.id,
        "email":         resp.user.email,
        "access_token":  resp.session.access_token  if resp.session else None,
        "refresh_token": resp.session.refresh_token if resp.session else None,
    }


def get_user_by_id(user_id: str) -> dict:
    db = get_client()
    print(f"DB get_user_by_id: {user_id}")
    result = db.table("users").select("*").eq("user_id", user_id).execute()
    print("DB RESPONSE:", result.data)
    if not result.data:
        raise ValueError(f"User {user_id} not found.")
    return result.data[0]


# ---------------------------------------------------------------------------
# TASK 3: Meal plan storage
# Confirmed columns: user_id, total_calories, total_protein, total_carbs, generated_at
# ---------------------------------------------------------------------------

def save_meal_plan(
    user_id:        str,
    total_calories: float,
    total_protein:  float,
    total_carbs:    float,
    total_fats:     float = 0.0,
    access_token:   str   = "",
) -> dict:
    db = _auth_client(access_token) if access_token else get_client()
    print(f"DB save_meal_plan: user={user_id} cal={total_calories}")

    result = db.table("meal_plans").insert({
        "user_id":        user_id,
        "total_calories": total_calories,
        "total_protein":  total_protein,
        "total_carbs":    total_carbs,
        "total_fats":     total_fats,
    }).execute()

    print("DB RESPONSE save_meal_plan:", result.data)
    if not result.data:
        raise RuntimeError("Failed to save meal plan — no data returned.")
    return result.data[0]


def get_user_meal_plans(user_id: str) -> list:
    db = get_client()
    print(f"DB get_user_meal_plans: {user_id}")
    result = (
        db.table("meal_plans")
        .select("*")
        .eq("user_id", user_id)
        .order("generated_at", desc=True)
        .execute()
    )
    print("DB RESPONSE get_user_meal_plans:", result.data)
    return result.data or []


# ---------------------------------------------------------------------------
# TASK 4: Admin functions
# ---------------------------------------------------------------------------

def get_all_users() -> list:
    db = get_client()
    result = db.table("users").select("*").execute()
    print("DB RESPONSE get_all_users:", result.data)
    return result.data or []


def delete_user(user_id: str) -> bool:
    db = get_client()
    db.table("meal_plans").delete().eq("user_id", user_id).execute()
    result = db.table("users").delete().eq("user_id", user_id).execute()
    print("DB RESPONSE delete_user:", result.data)
    return bool(result.data)


def get_all_meal_plans() -> list:
    db = get_client()
    result = db.table("meal_plans").select("*").order("generated_at", desc=True).execute()
    print("DB RESPONSE get_all_meal_plans:", result.data)
    return result.data or []


def test_db_connection():
    client = get_client()
    response = client.table("users").select("*").execute()
    return response.data
