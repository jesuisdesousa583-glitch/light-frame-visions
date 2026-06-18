
-- 1) profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2) user_roles
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- 3) sessions guard
CREATE OR REPLACE FUNCTION public.guard_session_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() = OLD.patient_id AND auth.uid() <> OLD.therapist_id THEN
    IF NEW.notes       IS DISTINCT FROM OLD.notes
       OR NEW.price       IS DISTINCT FROM OLD.price
       OR NEW.duration    IS DISTINCT FROM OLD.duration
       OR NEW.therapist_id IS DISTINCT FROM OLD.therapist_id
       OR NEW.room_url    IS DISTINCT FROM OLD.room_url THEN
      RAISE EXCEPTION 'Patients cannot modify therapist-controlled fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS sessions_guard_update ON public.sessions;
CREATE TRIGGER sessions_guard_update
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.guard_session_update();
REVOKE EXECUTE ON FUNCTION public.guard_session_update() FROM PUBLIC, anon, authenticated;

-- 4) debug-attachments policies (bucket privacy set via storage API)
DROP POLICY IF EXISTS "Public upload debug-attachments" ON storage.objects;
DROP POLICY IF EXISTS "debug-attachments anon upload"   ON storage.objects;
DROP POLICY IF EXISTS "debug-attachments public read"   ON storage.objects;

CREATE POLICY "Auth users upload debug-attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'debug-attachments' AND auth.uid() = owner);
CREATE POLICY "Owners read debug-attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'debug-attachments' AND auth.uid() = owner);
CREATE POLICY "Owners delete debug-attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'debug-attachments' AND auth.uid() = owner);

-- 5) Revogar EXECUTE de funções SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.handle_new_user()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
