-- ============================================================
-- Nutrix DB Fixes — run this in the Supabase SQL Editor
-- https://app.supabase.com/project/kgedzhovmqtbytahtslp/editor
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT).
-- ============================================================


-- ============================================================
-- FIX 1 — Add `goal` column to public.users
-- ============================================================
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS goal TEXT DEFAULT 'maintain'
    CHECK (goal IN ('lose', 'maintain', 'gain'));


-- ============================================================
-- FIX 2 — Seed the conditions table
-- The ML model and optimizer both reference these exact IDs.
-- ============================================================
INSERT INTO public.conditions (condition_id, condition_name) VALUES
    ('diabetes',     'Diabetes'),
    ('hypertension', 'Hypertension'),
    ('cholesterol',  'High Cholesterol'),
    ('anemia',       'Anemia'),
    ('fit',          'Healthy / No Condition')
ON CONFLICT (condition_id) DO UPDATE
    SET condition_name = EXCLUDED.condition_name;


-- ============================================================
-- FIX 3 — RLS: allow users to INSERT and UPDATE their own row
--
-- The existing schema only has FOR SELECT for regular users.
-- The backend uses the service-role key (bypasses RLS), but
-- the React frontend uses the anon key and hits these policies
-- when writing profile data directly.
--
-- NOTE: PostgreSQL does not support CREATE POLICY IF NOT EXISTS.
-- Idempotency is achieved with DROP POLICY IF EXISTS first.
-- ============================================================

-- INSERT: a user can only insert a row where user_id = their own auth UID
DROP POLICY IF EXISTS "User Self Insert" ON public.users;
CREATE POLICY "User Self Insert"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: a user can only update their own row
DROP POLICY IF EXISTS "User Self Update" ON public.users;
CREATE POLICY "User Self Update"
    ON public.users
    FOR UPDATE
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- FIX 4 — Auth trigger → public.users (corrected field mapping)
--
-- Maps all available metadata fields at sign-up time.
-- age, gender, height_cm, weight_kg are NULL by default —
-- they are populated later by POST /profile/setup.
-- Safe to re-run: uses CREATE OR REPLACE + ON CONFLICT DO NOTHING.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (
        user_id,
        email,
        full_name,
        role,
        age,
        gender,
        height_cm,
        weight_kg
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
        -- Optional: pass these during signUp({ options: { data: { age, gender, … } } })
        NULLIF(NEW.raw_user_meta_data->>'age',       '')::INT,
        NULLIF(NEW.raw_user_meta_data->>'gender',    ''),
        NULLIF(NEW.raw_user_meta_data->>'height_cm', '')::DECIMAL,
        NULLIF(NEW.raw_user_meta_data->>'weight_kg', '')::DECIMAL
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Recreate trigger (targets auth.users, not profiles)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- FIX 5 — nutrition_targets: allow users to read their own targets
-- (the existing schema has no SELECT policy for this table)
-- ============================================================
DROP POLICY IF EXISTS "Users can read own targets" ON public.nutrition_targets;
CREATE POLICY "Users can read own targets"
    ON public.nutrition_targets
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
