
CREATE OR REPLACE FUNCTION public.assign_first_admin() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER assign_first_admin_trg
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();
