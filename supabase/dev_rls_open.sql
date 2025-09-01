-- Dev-only: otevře RLS pro testování anonymních klientů
-- POZOR: Spouštěj pouze v lokálním/dev prostředí

ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all (dev)" ON public.room_participants;
DROP POLICY IF EXISTS "Allow logged-in users to access participants" ON public.room_participants;
DROP POLICY IF EXISTS "Allow insert" ON public.room_participants;
CREATE POLICY "Allow all (dev)" ON public.room_participants
  FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.room_rows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all (dev)" ON public.room_rows;
DROP POLICY IF EXISTS "Allow logged-in users to access messages" ON public.room_rows;
CREATE POLICY "Allow all (dev)" ON public.room_rows
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- (volitelné) povolit veřejné SELECT pro rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all (dev)" ON public.rooms;
DROP POLICY IF EXISTS "Allow logged-in users to access rooms" ON public.rooms;
CREATE POLICY "Allow all (dev)" ON public.rooms
  FOR SELECT
  USING (true);
