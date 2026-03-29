-- ============================================================
-- Migration: 002 — Sync auth.users to public.users at signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metadata JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  preferred_username TEXT := NULLIF(TRIM(metadata ->> 'username'), '');
  email_local_part TEXT := SPLIT_PART(COALESCE(NEW.email, ''), '@', 1);
  base_username TEXT;
  candidate_username TEXT;
  attempt INTEGER := 0;
BEGIN
  base_username := LOWER(
    REGEXP_REPLACE(
      COALESCE(preferred_username, email_local_part, 'user'),
      '[^a-zA-Z0-9_]+',
      '_',
      'g'
    )
  );

  IF base_username = '' THEN
    base_username := 'user';
  END IF;

  LOOP
    candidate_username := CASE
      WHEN attempt = 0 THEN base_username
      ELSE base_username || '_' || attempt::TEXT
    END;

    BEGIN
      INSERT INTO public.users (id, email, username, role, avatar_url)
      VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        candidate_username,
        'USER',
        NULLIF(metadata ->> 'avatar_url', '')
      )
      ON CONFLICT (id) DO UPDATE
      SET
        email = EXCLUDED.email,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        updated_at = NOW();

      EXIT;
    EXCEPTION
      WHEN unique_violation THEN
        attempt := attempt + 1;
        IF attempt > 50 THEN
          RAISE EXCEPTION 'Unable to generate a unique username for auth user %', NEW.id;
        END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auth_users_sync_profile ON auth.users;
CREATE TRIGGER trg_auth_users_sync_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();

-- Backfill profiles for auth users created before this trigger existed.
INSERT INTO public.users (id, email, username, role, avatar_url)
SELECT
  au.id,
  COALESCE(au.email, ''),
  'user_' || REPLACE(au.id::TEXT, '-', ''),
  'USER',
  NULLIF(au.raw_user_meta_data ->> 'avatar_url', '')
FROM auth.users AS au
WHERE NOT EXISTS (
  SELECT 1
  FROM public.users AS pu
  WHERE pu.id = au.id
)
ON CONFLICT DO NOTHING;